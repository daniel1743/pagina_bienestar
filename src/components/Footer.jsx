
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-white px-4 py-16 transition-colors duration-300 dark:bg-background">
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt="Logo Bienestar en Claro"
                className="h-9 w-9 rounded-lg object-contain"
                loading="lazy"
                decoding="async"
              />
              <h3 className="text-xl font-bold text-foreground">
                <span className="text-primary">Bienestar</span> en Claro
              </h3>
            </div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              Divulgación editorial sobre salud metabólica con claridad, límites explícitos y enfoque
              latinoamericano.
            </p>
            <form
              action="/api/newsletter"
              method="post"
              className="rounded-2xl border border-border bg-card p-4"
            >
              <p className="text-sm font-semibold text-foreground">Recibe artículos nuevos y actualizaciones.</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="tu@email.com"
                  className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground focus:border-primary"
                />
                <button
                  type="submit"
                  className="h-10 rounded-xl bg-[#1d4e89] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#163b68]"
                >
                  Suscribirme
                </button>
              </div>
            </form>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">Temas</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/categorias/metabolismo" className="transition-colors hover:text-primary">
                  Metabolismo
                </Link>
              </li>
              <li>
                <Link to="/categorias/higado" className="transition-colors hover:text-primary">
                  Hígado
                </Link>
              </li>
              <li>
                <Link to="/categorias/insulina" className="transition-colors hover:text-primary">
                  Insulina
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">Recursos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/empieza-aqui" className="transition-colors hover:text-primary">
                  Empieza aquí
                </Link>
              </li>
              <li>
                <Link to="/sobre-mi" className="transition-colors hover:text-primary">
                  Sobre mí
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/descargo" className="transition-colors hover:text-primary">
                  Descargo médico
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="transition-colors hover:text-primary">
                  Política de privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bienestar en Claro. Contenido educativo, no diagnóstico médico.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
