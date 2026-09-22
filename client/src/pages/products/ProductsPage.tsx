import { useEffect, useState, type FormEvent } from "react";
import { createProduct, deactivateProduct, getProducts, updateProduct } from "../../services/productService";
import type { Product } from "../../types/product.types";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", description: "", unit: "sack", price: "" });
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function load(): Promise<void> {
    try { setProducts(await getProducts()); setError(null); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to load products."); }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    try {
      if (editingId) {
        await updateProduct(editingId, { ...form, price: Number(form.price) });
      } else {
        await createProduct({ ...form, price: Number(form.price) });
      }
      setForm({ name: "", description: "", unit: "sack", price: "" });
      setEditingId(null);
      await load();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to save product."); }
  }

  return <section className="space-y-6">
    <PageHeader eyebrow="Catalog" title="Products" description="Maintain the ingredients available for distribution." />
    {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="surface overflow-x-auto p-4">
            <table className="w-full min-w-[540px] text-left text-sm">
              <thead className="border-b border-stone-200 text-stone-500"><tr><th className="p-3">Product</th><th className="p-3">Unit</th><th className="p-3">Price</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
              <tbody>{products.map((product) => <tr className="border-b border-stone-100" key={product.id}><td className="p-3 font-medium">{product.name}</td><td className="p-3">{product.unit}</td><td className="p-3">{Number(product.price).toFixed(2)}</td><td className="p-3"><StatusBadge value={product.status} /></td><td className="space-x-2 p-3"><button className="text-amber-700 underline" onClick={() => { setEditingId(product.id); setForm({ name: product.name, description: product.description ?? "", unit: product.unit, price: String(product.price) }); }}>Edit</button>{product.status === "ACTIVE" && <button className="text-red-700 underline" onClick={() => void deactivateProduct(product.id).then(load)}>Deactivate</button>}</td></tr>)}</tbody>
            </table>
          </div>
          <form className="surface space-y-4 p-5" onSubmit={submit}>
            <h3 className="text-lg font-semibold text-stone-800">{editingId ? "Edit product" : "Add product"}</h3>
            <input className="w-full rounded border border-stone-300 px-3 py-2" placeholder="Product name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <input className="w-full rounded border border-stone-300 px-3 py-2" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            <input className="w-full rounded border border-stone-300 px-3 py-2" placeholder="Unit" required value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
            <input className="w-full rounded border border-stone-300 px-3 py-2" type="number" min="0.01" step="0.01" placeholder="Price" required value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
            <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-900">Stock is managed separately in Inventory after this product is created.</p>
            <div className="flex gap-2"><button className="rounded bg-amber-700 px-4 py-2 font-semibold text-white">{editingId ? "Update product" : "Save product"}</button>{editingId && <button type="button" className="rounded border border-stone-300 px-4 py-2" onClick={() => { setEditingId(null); setForm({ name: "", description: "", unit: "sack", price: "" }); }}>Cancel</button>}</div>
          </form>
    </div>
  </section>;
}

export default ProductsPage;
