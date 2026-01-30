'use client';

import { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  available: boolean;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
  display_order: number;
}

const defaultCategories: Category[] = [
  { id: 'cocktails', name: 'Cócteles', display_order: 1 },
  { id: 'shots', name: 'Shots', display_order: 2 },
  { id: 'bottles', name: 'Botellas', display_order: 3 },
  { id: 'food', name: 'Comida', display_order: 4 },
  { id: 'specials', name: 'Especiales', display_order: 5 },
];

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('cocktails');
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    category: 'cocktails',
    name: '',
    description: '',
    price: '',
    image_url: '',
    available: true,
    featured: false,
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    display_order: 99,
  });

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
        if (!data.categories.find((c: Category) => c.id === activeCategory)) {
          setActiveCategory(data.categories[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const openModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        category: item.category,
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        image_url: item.image_url || '',
        available: item.available,
        featured: item.featured || false,
      });
    } else {
      setEditingItem(null);
      setFormData({
        category: activeCategory,
        name: '',
        description: '',
        price: '',
        image_url: '',
        available: true,
        featured: false,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        display_order: category.display_order,
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: '',
        display_order: categories.length + 1,
      });
    }
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      ...(editingItem && { id: editingItem.id }),
    };

    try {
      const res = await fetch('/api/menu', {
        method: editingItem ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchItems();
        closeModal();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/categories', {
        method: editingCategory ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...categoryFormData,
          ...(editingCategory && { id: editingCategory.id }),
        }),
      });

      if (res.ok) {
        fetchCategories();
        closeCategoryModal();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al guardar la categoría');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      const res = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        fetchCategories();
        if (activeCategory === id && categories.length > 1) {
          const remaining = categories.filter(c => c.id !== id);
          setActiveCategory(remaining[0]?.id || 'cocktails');
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Error al eliminar la categoría');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleAvailable = async (item: MenuItem) => {
    try {
      const res = await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, available: !item.available }),
      });

      if (res.ok) {
        setItems(prev =>
          prev.map(i => (i.id === item.id ? { ...i, available: !i.available } : i))
        );
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleFeatured = async (item: MenuItem) => {
    try {
      const res = await fetch('/api/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, featured: !item.featured }),
      });

      if (res.ok) {
        setItems(prev =>
          prev.map(i => (i.id === item.id ? { ...i, featured: !i.featured } : i))
        );
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este item?')) return;

    try {
      const res = await fetch('/api/menu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredItems = items.filter(i => i.category === activeCategory);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-white">Menú</h1>
        <div className="flex gap-2">
          <button
            onClick={() => openCategoryModal()}
            className="bg-brand-gold text-black px-4 py-2 rounded-lg hover:bg-brand-gold-light transition-colors text-sm"
          >
            + Categoría
          </button>
          <button
            onClick={() => openModal()}
            className="bg-white text-black px-6 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            + Agregar Item
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 items-center">
        {categories.map((cat) => (
          <div key={cat.id} className="relative group flex-shrink-0">
            <button
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
            {/* Edit/Delete buttons on hover */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex gap-1 bg-zinc-800 rounded-lg p-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openCategoryModal(cat);
                }}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1"
                title="Editar"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCategory(cat.id);
                }}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="text-zinc-500 text-center py-8">Cargando...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-zinc-500 text-center py-8">No hay items en esta categoría</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-zinc-900 border rounded-lg p-4 relative ${
                !item.available ? 'opacity-50 border-zinc-800' : item.featured ? 'border-yellow-500/50' : 'border-zinc-800'
              }`}
            >
              {/* Featured Star Badge */}
              {item.featured && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <span>⭐</span>
                  <span className="font-medium">Home</span>
                </div>
              )}

              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-medium">{item.name}</h3>
                <span className="text-white font-bold">${item.price}</span>
              </div>
              {item.description && (
                <p className="text-zinc-500 text-sm mb-4">{item.description}</p>
              )}

              {/* Toggle buttons row */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => toggleAvailable(item)}
                  className={`text-xs px-3 py-1 rounded ${
                    item.available
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'bg-red-500/20 text-red-500'
                  }`}
                >
                  {item.available ? 'Disponible' : 'No disponible'}
                </button>
                <button
                  onClick={() => toggleFeatured(item)}
                  className={`text-xs px-3 py-1 rounded ${
                    item.featured
                      ? 'bg-yellow-500/20 text-yellow-500'
                      : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {item.featured ? '⭐ En Home' : '☆ Mostrar en Home'}
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  onClick={() => openModal(item)}
                  className="text-zinc-500 hover:text-white text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-red-500 hover:text-red-400 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl text-white mb-6">
              {editingItem ? 'Editar Item' : 'Nuevo Item'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-500 text-sm mb-2">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-500 text-sm mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white"
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 text-sm mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-zinc-500 text-sm mb-2">Precio (MXN)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-white"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="available" className="text-zinc-400">Disponible</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="featured" className="text-zinc-400 flex items-center gap-1">
                    <span>⭐</span> Mostrar en Home
                  </label>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-zinc-700 text-white py-2 rounded-lg hover:border-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-white text-black py-2 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  {editingItem ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-brand-gold/30 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl text-white mb-6 flex items-center gap-2">
              <span className="text-brand-gold">📁</span>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-500 text-sm mb-2">Nombre de la Categoría</label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-brand-gold"
                  placeholder="Ej: Cervezas, Vinos, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-zinc-500 text-sm mb-2">Orden de visualización</label>
                <input
                  type="number"
                  value={categoryFormData.display_order}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, display_order: parseInt(e.target.value) })}
                  className="w-full bg-black border border-zinc-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-brand-gold"
                  min="1"
                />
                <p className="text-zinc-600 text-xs mt-1">Número menor = aparece primero</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="flex-1 border border-zinc-700 text-white py-2 rounded-lg hover:border-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-gold text-black py-2 rounded-lg hover:bg-brand-gold-light transition-colors font-medium"
                >
                  {editingCategory ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
