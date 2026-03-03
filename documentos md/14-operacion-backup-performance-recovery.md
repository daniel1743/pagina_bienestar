# Operación Importante — Carga + Backup + Recuperación (Vercel)

Fecha: 2026-03-02  
Proyecto: Bienestar en Claro  
Hosting: Vercel  
Fuente de datos: Supabase (Postgres + Storage)

## 1) Objetivo y alcance

Este documento define el procedimiento operativo para:

1. Verificar tiempos de carga de rutas críticas.
2. Ejecutar backups de recuperación (código + DB + Storage).
3. Recuperar servicio si se rompe código o datos.
4. Mantener evidencia operativa y trazabilidad.

Decisiones vigentes:

1. Frecuencia backup: diario + antes de deploy.
2. Cobertura: código + DB + Storage.
3. Retención inicial: 30 días.

## 2) Línea base de carga (snapshot inicial)

Medición sintética registrada:

1. `/`: TTFB ~724ms, total ~741ms, HTML ~4468 bytes.
2. `/articulos`: TTFB ~101ms, total ~103ms, HTML ~4468 bytes.
3. `/articulos/higado-graso-en-chile-...`: TTFB ~103ms, total ~109ms, HTML ~4468 bytes.
4. `/articulos/helicobacter-pylori-...`: TTFB ~84ms, total ~86ms, HTML ~4468 bytes.
5. `/sitemap.xml`: TTFB ~2284ms, total ~2287ms, ~4423 bytes (MISS).

Umbrales de alerta recomendados:

1. Artículos con TTFB > 800ms sostenido (3 corridas seguidas).
2. `/sitemap.xml` > 2000ms sostenido (3 corridas seguidas).
3. Cualquier URL crítica con status distinto a 200.

## 3) Scripts operativos incluidos

Ruta `tools/`:

1. `perf-snapshot.mjs`  
   Genera snapshot de carga en JSON.
2. `backup-predeploy.ps1`  
   Crea y publica tag de respaldo predeploy.
3. `backup-supabase.ps1`  
   Backup DB + manifest Storage + snapshot de archivos Storage.
4. `backup-storage-manifest.mjs`  
   Inventario completo de objetos por bucket.
5. `backup-storage-download.mjs`  
   Descarga snapshot de archivos de buckets.
6. `restore-db.ps1`  
   Restore de base de datos desde dump.
7. `restore-storage-upload.mjs`  
   Restore de archivos a Storage desde carpeta local.

Scripts `npm`:

```bash
npm run perf:snapshot
npm run backup:daily
npm run backup:predeploy
npm run backup:tag:predeploy
npm run restore:storage
```

## 4) Variables de entorno requeridas

No guardar secretos en repo. Usar entorno seguro (local seguro, CI secrets, Vercel env).

Obligatorias para backup/restore:

1. `SUPABASE_URL`
2. `SUPABASE_SERVICE_ROLE_KEY`
3. `SUPABASE_DB_URL` (cadena de conexión Postgres directa para `pg_dump/pg_restore`)

Opcionales:

1. `SITE_URL` (default: `https://bienestarenclaro.com`)
2. `BACKUP_STORAGE_BUCKETS` (default: `article-images,profiles`)
3. `PERF_ARTICLE_SAMPLE_COUNT` (default: `3`)

## 5) Proceso diario (operación mínima)

1. Ejecutar snapshot de carga:

```bash
npm run perf:snapshot
```

2. Ejecutar backup diario:

```bash
npm run backup:daily
```

3. Subir artefactos cifrados a almacenamiento privado.
4. Verificar checksum `.sha256` de cada archivo subido.

Artefactos esperados:

1. `backup-db-YYYYMMDD-HHMMSS.dump`
2. `backup-db-...dump.sha256`
3. `backup-storage-manifest-YYYYMMDD-HHMMSS.json`
4. `backup-storage-manifest-...json.sha256`
5. `backup-storage-YYYYMMDD-HHMMSS.tar.gz` (o `.zip` si no hay `tar`)
6. `backup-storage-...tar.gz.sha256` (o `.zip.sha256`)
7. `perf-snapshot-YYYYMMDD-HHMMSS.json`

## 6) Runbook predeploy (obligatorio)

Antes de `vercel --prod --yes`:

1. Tag de respaldo:

```bash
npm run backup:tag:predeploy
```

2. Backup predeploy:

```bash
npm run backup:predeploy
```

3. Build local:

```bash
npm run build
```

4. Deploy:

```bash
vercel --prod --yes
```

5. Smoke test postdeploy:

1. `https://bienestarenclaro.com/` -> 200
2. 2 artículos -> 200
3. `https://bienestarenclaro.com/sitemap.xml` -> 200
4. Console sin errores críticos nuevos

Política: no hacer deploy productivo sin tag + backup predeploy válido.

## 7) Restore (recuperación)

## 7.1 Restore DB

1. Descargar dump objetivo.
2. Exportar `SUPABASE_DB_URL`.
3. Ejecutar:

```bash
pwsh -File tools/restore-db.ps1 -DumpPath "ruta\\backup-db-YYYYMMDD-HHMMSS.dump"
```

4. Validar:

1. Conteo de artículos esperado.
2. Campos SEO presentes.
3. Últimos artículos accesibles.

## 7.2 Restore Storage

1. Extraer snapshot de storage (`tar.gz` o `zip`) a carpeta local.
2. Exportar variables:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
RESTORE_STORAGE_INPUT_DIR=.../backup-storage-YYYYMMDD-HHMMSS
```

3. Ejecutar:

```bash
npm run restore:storage
```

4. Validar:

1. 3 imágenes de artículos cargan 200.
2. `image_url` en DB apunta a objetos existentes.

## 7.3 Rollback de código

1. Identificar tag estable: `backup-predeploy-YYYYMMDD-HHMM`.
2. Re-deploy de commit/tag estable en Vercel.
3. Verificar:

1. Home 200
2. Artículos 200
3. Sitemap 200

## 8) Checklist post-incidente

1. Home y rutas clave responden 200.
2. `/articulos/<slug>` responde 200 (mínimo 3 slugs).
3. `<title>`, `description`, `canonical`, `robots` correctos en DOM.
4. `/sitemap.xml` responde 200 y contiene URLs de artículos.
5. Carga de imágenes internas sin 404.
6. Consola sin errores críticos de Supabase.
7. Search Console: URL de prueba “disponible para Google”.

## 9) Riesgos y mitigaciones

1. Dump DB corrupto.
   Mitigación: restore de prueba regular y checksum.
2. Snapshot Storage incompleto.
   Mitigación: manifest + conteo de archivos + checksum.
3. Degradación silenciosa de performance.
   Mitigación: snapshot diario + umbrales.
4. Rollback lento.
   Mitigación: tags predeploy y runbook estándar.

## 10) Responsables (completar)

1. Operación diaria backup: `<responsable>`
2. Aprobación predeploy: `<responsable>`
3. Ejecución restore: `<responsable>`
4. Validación SEO post-incidente: `<responsable>`

## 11) Changelog

1. 2026-03-02 — Se agrega runbook operativo de carga + backup + recuperación con scripts en `tools/`.
