import Link from "next/link";
import { Shell } from "../components";
import { categoryIcon, MarketIcon } from "../icons";
import { categories } from "../store-data";

export default function CategoriesPage() {
  return (
    <Shell>
      <main className="container">
        <header className="page-head">
          <span className="crumb">Início / Categorias</span>
          <h1>Categorias</h1>
          <p>Selecione um departamento.</p>
        </header>
        <section className="category-grid category-page-grid">
          {categories.map((category) => (
            <Link
              className="category"
              href={`/categorias/${category.slug}`}
              key={category.slug}
            >
              <span className="category-emoji">
                <MarketIcon name={categoryIcon[category.slug] ?? "basket"} />
              </span>
              <b>{category.name}</b>
              <small>
                Ver produtos <MarketIcon name="arrow" />
              </small>
            </Link>
          ))}
        </section>
      </main>
    </Shell>
  );
}
