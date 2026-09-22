import { useEffect, useState, type FormEvent } from "react";
import { createInventory, getInventory, updateInventory } from "../../services/inventoryService";
import type { InventoryItem } from "../../types/inventory.types";
import { getProducts } from "../../services/productService";
import type { Product } from "../../types/product.types";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { createStockMovement, getStockMovements } from "../../services/stockMovementService";
import type { StockMovement } from "../../types/stock-movement.types";

function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stockForm, setStockForm] = useState({ inventoryId: "", quantity: "", reference: "", notes: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [minimumStock, setMinimumStock] = useState("0");

  async function load(): Promise<void> {
    try {
      const [inventory, stockMovements, productList] = await Promise.all([getInventory(), getStockMovements(), getProducts()]);
      setItems(inventory);
      setMovements(stockMovements);
      setProducts(productList);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load inventory.");
    }
  }

  const inventoryProductIds = new Set(items.map((item) => item.productId));
  const productsWithoutInventory = products.filter((product) => product.status === "ACTIVE" && !inventoryProductIds.has(product.id));

  async function initializeInventory(productId: number): Promise<void> {
    const stockThreshold = Number(minimumStock);
    if (!Number.isInteger(stockThreshold) || stockThreshold < 0) {
      setError("Minimum stock must be a whole number of zero or more.");
      return;
    }

    setIsInitializing(true);
    try {
      await createInventory({ productId, quantity: 0, minimumStock: stockThreshold });
      setMinimumStock("0");
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to set up inventory.");
    } finally {
      setIsInitializing(false);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);

  async function updateMinimum(id: number, value: string): Promise<void> {
    const minimumStock = Number(value);
    if (!Number.isInteger(minimumStock) || minimumStock < 0) return;
    try { await updateInventory(id, { minimumStock }); await load(); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to update inventory."); }
  }

  async function addStock(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const quantity = Number(stockForm.quantity);
    const inventoryId = Number(stockForm.inventoryId);
    if (!Number.isInteger(quantity) || quantity <= 0 || !Number.isInteger(inventoryId)) {
      setError("Enter a whole-number stock quantity and select a product.");
      return;
    }

    setIsSaving(true);
    try {
      await createStockMovement({ inventoryId, type: "IN", reason: "PURCHASE", quantity, reference: stockForm.reference || undefined, notes: stockForm.notes || undefined });
      setStockForm({ inventoryId: "", quantity: "", reference: "", notes: "" });
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to add stock.");
    } finally {
      setIsSaving(false);
    }
  }

  return <section className="space-y-6">
    <PageHeader eyebrow="Operations" title="Inventory" description="Track current stock and record supplier receipts as stock-in movements." />
    {error && <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {productsWithoutInventory.length > 0 && <div className="surface border-amber-200 bg-amber-50 p-5"><h3 className="text-lg font-semibold text-stone-800">Products awaiting inventory setup</h3><p className="mt-1 text-sm text-stone-600">These active products exist in the catalog but do not have inventory records yet. Set one up with quantity 0 before receiving stock.</p><div className="mt-4 space-y-3">{productsWithoutInventory.map((product) => <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-200 pt-3" key={product.id}><div><strong>{product.name}</strong><span className="ml-2 text-sm text-stone-500">({product.unit})</span></div><div className="flex items-center gap-2"><label className="text-sm text-stone-600">Minimum stock<input className="ml-2 w-20 rounded border border-stone-300 bg-white px-2 py-1" type="number" min="0" step="1" value={minimumStock} onChange={(event) => setMinimumStock(event.target.value)} /></label><button className="rounded bg-amber-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={isInitializing} onClick={() => void initializeInventory(product.id)} type="button">{isInitializing ? "Setting up..." : "Set up inventory"}</button></div></div>)}</div></div>}
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="surface overflow-x-auto p-4">
        <table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-stone-200 text-stone-500"><tr><th className="p-3">Product</th><th className="p-3">Quantity left</th><th className="p-3">Minimum stock</th><th className="p-3">Status</th></tr></thead><tbody>{items.map((item) => <tr className="border-b border-stone-100" key={item.id}><td className="p-3 font-medium">{item.productName}</td><td className="p-3 font-semibold">{Number(item.quantity)}</td><td className="p-3"><input className="w-28 rounded border border-stone-300 px-2 py-1" type="number" min="0" step="1" defaultValue={Number(item.minimumStock)} onBlur={(event) => void updateMinimum(item.id, event.target.value)} /></td><td className="p-3"><StatusBadge value={item.stockStatus} /></td></tr>)}</tbody></table>
        {items.length === 0 && <p className="p-3 text-sm text-stone-500">No inventory records found. Create an inventory record before receiving stock.</p>}
      </div>
      <form className="surface space-y-4 p-5" onSubmit={addStock}>
        <div><h3 className="text-lg font-semibold text-stone-800">Add stock</h3><p className="mt-1 text-sm text-stone-500">Record a supplier receipt. This increases quantity and creates a PURCHASE movement.</p></div>
        <label className="grid gap-1 text-sm font-medium text-stone-700">Product<select className="rounded border border-stone-300 px-3 py-2" required value={stockForm.inventoryId} onChange={(event) => setStockForm({ ...stockForm, inventoryId: event.target.value })}><option value="">Select inventory</option>{items.map((item) => <option key={item.id} value={item.id}>{item.productName}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">Quantity received<input className="rounded border border-stone-300 px-3 py-2" type="number" min="1" step="1" required value={stockForm.quantity} onChange={(event) => setStockForm({ ...stockForm, quantity: event.target.value })} /></label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">Reference <span className="font-normal text-stone-500">(optional)</span><input className="rounded border border-stone-300 px-3 py-2" placeholder="Invoice or delivery reference" value={stockForm.reference} onChange={(event) => setStockForm({ ...stockForm, reference: event.target.value })} /></label>
        <label className="grid gap-1 text-sm font-medium text-stone-700">Notes <span className="font-normal text-stone-500">(optional)</span><textarea className="rounded border border-stone-300 px-3 py-2" rows={2} value={stockForm.notes} onChange={(event) => setStockForm({ ...stockForm, notes: event.target.value })} /></label>
        <button className="rounded bg-amber-700 px-4 py-2 font-semibold text-white disabled:opacity-50" disabled={isSaving || items.length === 0} type="submit">{isSaving ? "Adding stock..." : "Add stock"}</button>
      </form>
    </div>
    <div className="surface overflow-x-auto p-4"><h3 className="mb-3 text-lg font-semibold">Recent stock movements</h3><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-stone-200 text-stone-500"><tr><th className="p-3">Product</th><th className="p-3">Type</th><th className="p-3">Reason</th><th className="p-3">Quantity</th><th className="p-3">Date</th></tr></thead><tbody>{movements.slice(0, 12).map((movement) => <tr className="border-b border-stone-100" key={movement.id}><td className="p-3">{movement.inventory?.product?.name ?? movement.inventoryId}</td><td className="p-3"><StatusBadge value={movement.type} /></td><td className="p-3">{movement.reason.replaceAll("_", " ")}</td><td className="p-3">{Number(movement.quantity)}</td><td className="p-3">{new Date(movement.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table>{movements.length === 0 && <p className="text-sm text-stone-500">No stock movements recorded.</p>}</div>
  </section>;
}

export default InventoryPage;
