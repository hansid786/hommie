import React, { useState } from 'react';
import { MapPin, CheckCircle2, X, Search, LockKeyhole } from 'lucide-react';
import { getCities, getCustomerServiceAddress, setCustomerServiceAddress } from '../../services/hommieState';

export default function LocationSelectorModal({ isOpen, onClose, activeLocality, activeCity }) {
  const [cities] = useState(getCities());
  const saved = getCustomerServiceAddress();
  const [selectedCityId, setSelectedCityId] = useState(activeCity?.id || 'lko');
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState(saved || {
    flatNo: '',
    pincode: '226010',
    street: '',
    landmark: '',
    locality: 'Gomti Nagar',
    city: 'Lucknow'
  });
  if (!isOpen) return null;
  const currentCity = cities.find((city) => city.id === selectedCityId) || cities[0];
  const localities = (currentCity?.localities || []).filter((loc) =>
    (loc.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (loc.pincode || '').includes(searchQuery)
  );
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const save = (event) => {
    event.preventDefault();
    if (!form?.flatNo?.trim() || !form?.street?.trim() || !form?.pincode?.trim()) return;
    setCustomerServiceAddress({ ...form, city: currentCity.name });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <form onSubmit={save} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center"><MapPin className="w-5 h-5" /></div><div><h3 className="font-extrabold text-slate-900">Where should we send your pro?</h3><p className="text-xs text-slate-500">Save one exact service address for faster bookings.</p></div></div>
          <button type="button" onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3"><label className="text-xs font-bold text-slate-600">Flat / house number<input required value={form.flatNo} onChange={(e) => update('flatNo', e.target.value)} placeholder="Flat 302" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-amber-500" /></label><label className="text-xs font-bold text-slate-600">PIN code<input required value={form.pincode} onChange={(e) => update('pincode', e.target.value)} placeholder="226010" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-amber-500" /></label></div>
        <label className="mt-3 block text-xs font-bold text-slate-600">Street / society<input required value={form.street} onChange={(e) => update('street', e.target.value)} placeholder="12th Main Road, Palm Heights" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-amber-500" /></label>
        <label className="mt-3 block text-xs font-bold text-slate-600">Landmark <span className="font-normal text-slate-400">(optional)</span><input value={form.landmark} onChange={(e) => update('landmark', e.target.value)} placeholder="Near City Mall" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal text-slate-900 outline-none focus:border-amber-500" /></label>
        <div className="mt-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Choose service locality</p><div className="grid grid-cols-2 gap-2">{cities.map((city) => <button type="button" key={city.id} onClick={() => { setSelectedCityId(city.id); update('city', city.name); }} className={`p-3 rounded-2xl border text-left ${selectedCityId === city.id ? 'border-amber-500 bg-amber-50 font-bold' : 'border-slate-200 bg-slate-50 text-slate-600'}`}><span className="text-sm block">{city.name}</span><span className="text-[10px] text-slate-400">{city.state}</span></button>)}</div></div>
        <div className="mt-4 relative"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Search locality in ${currentCity.name}`} className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-500" /></div>
        <div className="mt-2 max-h-40 overflow-y-auto space-y-1">{localities.map((loc) => <button type="button" key={loc.id} disabled={!loc.active} onClick={() => { update('locality', loc.name); update('pincode', loc.pincode); }} className={`w-full p-3 rounded-xl border text-left flex justify-between ${form.locality === loc.name ? 'border-amber-500 bg-amber-50' : 'border-slate-200'} ${!loc.active ? 'opacity-50' : ''}`}><span><span className="block text-sm font-bold">{loc.name}</span><span className="text-[10px] text-slate-400">PIN: {loc.pincode}</span></span>{form.locality === loc.name && <CheckCircle2 className="w-4 h-4 text-amber-600" />}</button>)}</div>
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600"><LockKeyhole className="w-4 h-4 shrink-0 text-emerald-600" />Your address is saved securely and shared only with the worker assigned to this booking. HOMMIE never tracks your live location.</div>
        <button type="submit" className="mt-5 w-full rounded-xl bg-slate-950 py-3 text-sm font-extrabold text-amber-400 hover:bg-slate-900">Save exact service address</button>
      </form>
    </div>
  );
}
