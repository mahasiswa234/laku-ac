import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Package,
  Snowflake,
  Wind,
  Fan
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type Product = {
  id: number;
  product_code: string;
  name: string;
  category: 'indoor' | 'outdoor' | 'freon';
  brand: string;
  description?: string;
  price: number;
  image_url?: string | null;
};

const labels = {
  indoor: 'Unit Indoor',
  outdoor: 'Unit Outdoor',
  freon: 'Freon'
};

const getProductImage = (product: Product) => {
  return product.image_url || '';
};

export default function Pricing() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const initial =
    params.get('kategori') as keyof typeof labels | null;

  const [category, setCategory] = useState<
    'semua' | 'indoor' | 'outdoor' | 'freon'
  >(
    initial && labels[initial]
      ? initial
      : 'semua'
  );

  const [products, setProducts] = useState<Product[]>([]);

  /* =====================================================
     LOAD PRODUCTS
  ===================================================== */
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) =>
        setProducts(Array.isArray(data) ? data : [])
      )
      .catch(() => setProducts([]));
  }, []);

  /* =====================================================
     SYNC CATEGORY WITH URL
  ===================================================== */
  useEffect(() => {
    const c = params.get('kategori') as any;

    if (['indoor', 'outdoor', 'freon'].includes(c)) {
      setCategory(c);
    } else {
      setCategory('semua');
    }
  }, [params]);

  /* =====================================================
     FILTER PRODUCTS
  ===================================================== */
  const filtered = useMemo(
    () =>
      category === 'semua'
        ? products
        : products.filter(
            (p) => p.category === category
          ),
    [products, category]
  );

  /* =====================================================
     SELECT CATEGORY
  ===================================================== */
  const selectCategory = (c: any) => {
    setCategory(c);

    navigate(
      c === 'semua'
        ? '/produk'
        : `/produk?kategori=${c}`,
      {
        replace: true
      }
    );
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <div
        className="
          text-center
          max-w-3xl
          mx-auto
          mb-10
          animate-[fadeInUp_0.7s_ease-out]
        "
      >
        <div
          className="
            inline-flex
            items-center
            gap-2
            px-3
            py-1
            rounded-full
            bg-blue-50
            dark:bg-blue-950/40
            text-blue-700
            dark:text-blue-300
            text-xs
            font-bold
            mb-3
            transition-all
            duration-300
            hover:scale-105
            hover:shadow-md
          "
        >
          <Package
            size={14}
            className="transition-transform duration-500 hover:rotate-12"
          />

          Katalog Produk
        </div>

        <h1
          className="
            text-3xl
            sm:text-4xl
            font-extrabold
            text-slate-900
            dark:text-slate-100
          "
        >
          Produk Laku AC
        </h1>

        <p
          className="
            text-slate-600
            dark:text-slate-400
            mt-3
          "
        >
          Pilih unit indoor, unit outdoor, atau freon
          berdasarkan merk dan harga yang tersedia.
        </p>
      </div>

      {/* =====================================================
          CATEGORY FILTER
      ===================================================== */}
      <div
        className="
          flex
          flex-wrap
          justify-center
          gap-2
          mb-8
        "
      >
        {(
          ['semua', 'indoor', 'outdoor', 'freon'] as const
        ).map((c, index) => (
          <button
            key={c}
            onClick={() => selectCategory(c)}
            style={{
              animationDelay: `${index * 80}ms`
            }}
            className={`
              px-4
              py-2
              rounded-xl
              text-sm
              font-semibold
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-md
              active:scale-95
              animate-[fadeInUp_0.5s_ease-out_both]

              ${
                category === c
                  ? `
                    bg-blue-600
                    text-white
                    shadow-md
                    shadow-blue-500/30
                    scale-105
                  `
                  : `
                    bg-white
                    dark:bg-black
                    border
                    border-slate-200
                    dark:border-white/10
                    text-slate-600
                    dark:text-slate-300
                    hover:border-blue-400
                    hover:text-blue-600
                    dark:hover:text-blue-400
                  `
              }
            `}
          >
            {c === 'semua'
              ? 'Semua Produk'
              : labels[c]}
          </button>
        ))}
      </div>

      {/* =====================================================
          PRODUCT LIST
      ===================================================== */}
      {filtered.length === 0 ? (
        <div
          className="
            py-16
            text-center
            text-slate-500
            animate-[fadeInUp_0.5s_ease-out]
          "
        >
          Produk belum tersedia.
        </div>
      ) : (
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-6
          "
        >
          {filtered.map((p, index) => (
            <article
              key={p.id}
              style={{
                animationDelay: `${index * 100}ms`
              }}
              className="
                group
                bg-white
                dark:bg-black
                rounded-3xl
                border
                border-slate-200/80
                dark:border-white/10
                overflow-hidden
                shadow-sm
                hover:shadow-xl
                hover:-translate-y-2
                transition-all
                duration-500
                ease-out
                animate-[fadeInUp_0.6s_ease-out_both]
              "
            >

              {/* =====================================================
                  PRODUCT IMAGE
              ===================================================== */}
              <div
                className="
                  h-56
                  bg-slate-50
                  dark:bg-black
                  flex
                  items-center
                  justify-center
                  p-5
                  overflow-hidden
                "
              >
                <img
                  src={
                    p.image_url ||
                    fallbackImages[p.category]
                  }
                  alt={`${p.brand} ${p.name}`}
                  className="
                    h-full
                    w-full
                    object-contain
                    transform
                    transition-all
                    duration-700
                    ease-out
                    group-hover:scale-110
                  "
                />
              </div>

              {/* =====================================================
                  PRODUCT INFORMATION
              ===================================================== */}
              <div className="p-6">

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-2
                    mb-2
                  "
                >
                  <span
                    className="
                      text-[11px]
                      uppercase
                      font-bold
                      px-2.5
                      py-1
                      rounded-full
                      bg-blue-50
                      dark:bg-blue-900/30
                      text-blue-700
                      dark:text-blue-300
                      transition-all
                      duration-300
                      group-hover:bg-blue-100
                      dark:group-hover:bg-blue-900/50
                    "
                  >
                    {labels[p.category]}
                  </span>

                  <span
                    className="
                      text-[11px]
                      text-slate-400
                    "
                  >
                    {p.product_code}
                  </span>
                </div>

                <h2
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                    dark:text-slate-100
                    transition-colors
                    duration-300
                    group-hover:text-blue-600
                    dark:group-hover:text-blue-400
                  "
                >
                  {p.brand}
                </h2>

                <h3
                  className="
                    font-semibold
                    text-slate-700
                    dark:text-slate-300
                    mt-1
                  "
                >
                  {p.name}
                </h3>

                <p
                  className="
                    text-xs
                    text-slate-500
                    dark:text-slate-400
                    mt-2
                    min-h-8
                  "
                >
                  {p.description}
                </p>

                {/* =====================================================
                    PRICE + BUTTON
                ===================================================== */}
                <div
                  className="
                    mt-5
                    flex
                    items-end
                    justify-between
                    gap-3
                  "
                >
                  <div>
                    <p
                      className="
                        text-[11px]
                        text-slate-400
                      "
                    >
                      Harga
                    </p>

                    <p
                      className="
                        text-2xl
                        font-extrabold
                        text-blue-600
                        dark:text-blue-400
                        transition-transform
                        duration-300
                        group-hover:scale-105
                        origin-left
                      "
                    >
                      Rp{' '}
                      {Number(
                        p.price
                      ).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        '/pelanggan/pesan',
                        {
                          state: {
                            preferredProductCategory:
                              p.category,

                            preferredProductId:
                              String(p.id),

                            preferredNotes:
                              `Produk ${p.brand} ${p.name}`
                          }
                        }
                      )
                    }
                    className="
                      px-4
                      py-2.5
                      rounded-xl
                      bg-blue-600
                      hover:bg-blue-700
                      text-white
                      text-xs
                      font-bold
                      inline-flex
                      items-center
                      gap-2
                      transition-all
                      duration-300
                      hover:scale-105
                      hover:shadow-lg
                      hover:shadow-blue-500/30
                      active:scale-95
                      group/btn
                    "
                  >
                    Pilih

                    <ArrowRight
                      size={14}
                      className="
                        transition-transform
                        duration-300
                        group-hover/btn:translate-x-1
                      "
                    />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* =====================================================
          CATEGORY INFORMATION
      ===================================================== */}
      <div
        className="
          mt-12
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
        "
      >

        {/* UNIT INDOOR */}
        <div
          className="
            group
            p-5
            rounded-2xl
            bg-blue-50
            dark:bg-blue-950/30
            transition-all
            duration-300
            hover:-translate-y-2
            hover:shadow-lg
            animate-[fadeInUp_0.6s_ease-out]
          "
        >
          <Wind
            className="
              text-blue-600
              mb-2
              transition-transform
              duration-500
              group-hover:scale-110
              group-hover:rotate-6
            "
          />

          <b
            className="
              text-slate-900
              dark:text-slate-100
            "
          >
            Unit Indoor
          </b>

          <p
            className="
              text-xs
              text-slate-500
              dark:text-slate-400
              mt-1
            "
          >
            Pilihan unit indoor berdasarkan merk.
          </p>
        </div>

        {/* UNIT OUTDOOR */}
        <div
          className="
            group
            p-5
            rounded-2xl
            bg-slate-100
            dark:bg-slate-900
            transition-all
            duration-300
            hover:-translate-y-2
            hover:shadow-lg
            animate-[fadeInUp_0.7s_ease-out]
          "
        >
          <Fan
            className="
              text-slate-600
              dark:text-slate-300
              mb-2
              transition-transform
              duration-500
              group-hover:scale-110
              group-hover:rotate-12
            "
          />

          <b
            className="
              text-slate-900
              dark:text-slate-100
            "
          >
            Unit Outdoor
          </b>

          <p
            className="
              text-xs
              text-slate-500
              dark:text-slate-400
              mt-1
            "
          >
            Pilihan unit outdoor berdasarkan merk.
          </p>
        </div>

        {/* FREON */}
        <div
          className="
            group
            p-5
            rounded-2xl
            bg-cyan-50
            dark:bg-cyan-950/30
            transition-all
            duration-300
            hover:-translate-y-2
            hover:shadow-lg
            animate-[fadeInUp_0.8s_ease-out]
          "
        >
          <Snowflake
            className="
              text-cyan-600
              mb-2
              transition-transform
              duration-500
              group-hover:scale-110
              group-hover:rotate-12
            "
          />

          <b
            className="
              text-slate-900
              dark:text-slate-100
            "
          >
            Freon
          </b>

          <p
            className="
              text-xs
              text-slate-500
              dark:text-slate-400
              mt-1
            "
          >
            Jenis freon sesuai kebutuhan unit AC.
          </p>
        </div>

      </div>
    </div>
  );
}