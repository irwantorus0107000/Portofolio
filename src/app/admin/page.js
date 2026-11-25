'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

async function requestJson(url, options) {
  const response = await fetch(url, { cache: 'no-store', ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Permintaan gagal (${response.status})`);
  return data;
}

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('data-diri');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);
  
  // Refs untuk upload
  const fileInputRef = useRef(null);
  const sertifikatFileRef = useRef(null);

  // State untuk Data Diri
  const [config, setConfig] = useState({
    nama: '', foto_profil: '', tentang: '', email: '', linkedin: '', github: ''
  });

  // State untuk list
  const [pengalamanList, setPengalamanList] = useState([]);
  const [proyekList, setProyekList] = useState([]);
  const [pendidikanList, setPendidikanList] = useState([]);
  const [sertifikatList, setSertifikatList] = useState([]);

  // State untuk form
  const [formPengalaman, setFormPengalaman] = useState({ tahun: '', posisi: '', perusahaan: '', deskripsi: '' });
  const [formProyek, setFormProyek] = useState({ nama: '', tahun: '', deskripsi: '', teknologi: '' });
  const [formPendidikan, setFormPendidikan] = useState({ tahun: '', institusi: '', jurusan: '' });
  const [formSertifikat, setFormSertifikat] = useState({ nama: '', gambar: '', tahun_terbit: '' });

  // State untuk upload
  const [uploading, setUploading] = useState(false);
  const [uploadingSertifikat, setUploadingSertifikat] = useState(false);
  const [previewFoto, setPreviewFoto] = useState('');

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const loadConfig = async () => {
    try {
      const data = await requestJson('/api/config');
      setConfig(data);
      setPreviewFoto(data.foto_profil || '');
      return true;
    } catch (err) {
      console.error('Gagal memuat data diri:', err);
      showMessage('❌ Gagal memuat data diri.', 'error');
      return false;
    }
  };

  const loadList = async (url, setList) => {
    try {
      setList(await requestJson(url));
      return true;
    } catch (err) {
      console.error('Gagal memuat daftar:', err);
      showMessage('❌ Gagal memuat daftar data.', 'error');
      return false;
    }
  };

  const loadPengalaman = () => loadList('/api/pengalaman', setPengalamanList);
  const loadProyek = () => loadList('/api/pengalaman?collection=proyek', setProyekList);
  const loadPendidikan = () => loadList('/api/pendidikan', setPendidikanList);
  const loadSertifikat = () => loadList('/api/sertifikat', setSertifikatList);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    try {
      await requestJson('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      setIsLoggedIn(true);
      setError('');
      loadConfig();
      loadPengalaman();
      loadProyek();
      loadPendidikan();
      loadSertifikat();
    } catch (err) {
      setError('❌ ' + err.message);
    } finally {
      setPassword('');
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await requestJson('/api/admin/session', { method: 'DELETE' });
      setIsLoggedIn(false);
      setPassword('');
    } catch (err) {
      showMessage('❌ Gagal logout: ' + err.message, 'error');
    }
  };

  // ========== UPLOAD FOTO PROFIL (AUTO-SAVE) ==========
  const handleUploadFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview dulu
    const reader = new FileReader();
    reader.onload = (e) => setPreviewFoto(e.target?.result);
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { 
        method: 'POST', 
        body: formData 
      });
      const data = await res.json();
      
      if (data.success) {
        // Update config dengan URL baru
        const newConfig = { ...config, foto_profil: data.url };
        setConfig(newConfig);
        setPreviewFoto(data.url);
        
        // AUTO SAVE ke config.json
        const saveRes = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newConfig)
        });
        
        if (saveRes.ok) {
          showMessage('✅ Foto profil berhasil diupload & otomatis tersimpan!', 'success');
        } else {
          showMessage('⚠️ Foto terupload, klik "Simpan Semua Perubahan" untuk menyimpan', 'warning');
        }
      } else {
        showMessage('❌ ' + (data.error || 'Gagal upload'), 'error');
        setPreviewFoto(config.foto_profil);
      }
    } catch (err) {
      console.error('Upload error:', err);
      showMessage('❌ Gagal upload foto!', 'error');
      setPreviewFoto(config.foto_profil);
    }
    setUploading(false);
  };

  // ========== UPLOAD GAMBAR SERTIFIKAT ==========
  const handleUploadSertifikat = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSertifikat(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { 
        method: 'POST', 
        body: formData 
      });
      const data = await res.json();
      
      if (data.success) {
        // Otomatis isi field gambar dengan URL hasil upload
        setFormSertifikat({ 
          ...formSertifikat, 
          gambar: data.url 
        });
        showMessage('✅ Gambar sertifikat berhasil diupload!', 'success');
      } else {
        showMessage('❌ ' + (data.error || 'Gagal upload'), 'error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showMessage('❌ Gagal upload gambar!', 'error');
    }
    setUploadingSertifikat(false);
  };

  const saveConfig = async () => {
    setLoading(true);
    try {
      const data = await requestJson('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      showMessage('✅ ' + data.message, 'success');
    } catch (err) {
      showMessage('❌ Gagal menyimpan data: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const savePengalaman = async () => {
    if (!formPengalaman.tahun || !formPengalaman.posisi) {
      showMessage('⚠️ Tahun dan Posisi wajib diisi!', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await requestJson('/api/pengalaman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPengalaman)
      });
      showMessage('✅ ' + data.message, 'success');
      setFormPengalaman({ tahun: '', posisi: '', perusahaan: '', deskripsi: '' });
      await loadPengalaman();
    } catch (err) {
      showMessage('❌ Gagal menyimpan: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const saveProyek = async () => {
    if (!formProyek.nama || !formProyek.tahun || !formProyek.deskripsi) {
      showMessage('⚠️ Nama, tahun, dan deskripsi proyek wajib diisi!', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await requestJson('/api/pengalaman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formProyek, collection: 'proyek' })
      });
      showMessage('✅ ' + data.message, 'success');
      setFormProyek({ nama: '', tahun: '', deskripsi: '', teknologi: '' });
      await loadProyek();
    } catch (err) {
      showMessage('❌ Gagal menyimpan proyek: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const savePendidikan = async () => {
    if (!formPendidikan.tahun || !formPendidikan.institusi) {
      showMessage('⚠️ Tahun dan Institusi wajib diisi!', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await requestJson('/api/pendidikan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPendidikan)
      });
      showMessage('✅ ' + data.message, 'success');
      setFormPendidikan({ tahun: '', institusi: '', jurusan: '' });
      await loadPendidikan();
    } catch (err) {
      showMessage('❌ Gagal menyimpan: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const saveSertifikat = async () => {
    if (!formSertifikat.nama || !formSertifikat.gambar) {
      showMessage('⚠️ Nama dan Gambar wajib diisi!', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await requestJson('/api/sertifikat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formSertifikat)
      });
      showMessage('✅ ' + data.message, 'success');
      setFormSertifikat({ nama: '', gambar: '', tahun_terbit: '' });
      await loadSertifikat();
    } catch (err) {
      showMessage('❌ Gagal menyimpan: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const deleteItem = async (url, label, reload) => {
    if (!confirm(`Yakin hapus ${label.toLowerCase()} ini?`)) return;
    try {
      await requestJson(url, { method: 'DELETE' });
      showMessage(`✅ ${label} berhasil dihapus!`, 'success');
      await reload();
    } catch (err) {
      showMessage(`❌ Gagal menghapus ${label.toLowerCase()}: ${err.message}`, 'error');
    }
  };

  const deletePengalaman = (filename) => deleteItem(`/api/pengalaman?filename=${encodeURIComponent(filename)}`, 'Pengalaman', loadPengalaman);
  const deleteProyek = (filename) => deleteItem(`/api/pengalaman?collection=proyek&filename=${encodeURIComponent(filename)}`, 'Proyek', loadProyek);
  const deletePendidikan = (filename) => deleteItem(`/api/pendidikan?filename=${encodeURIComponent(filename)}`, 'Pendidikan', loadPendidikan);
  const deleteSertifikat = (filename) => deleteItem(`/api/sertifikat?filename=${encodeURIComponent(filename)}`, 'Sertifikat', loadSertifikat);

  // ========== LOGIN PAGE ==========
  if (!isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#131313', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px',
          padding: 'clamp(20px, 8vw, 40px)', maxWidth: '400px', width: '100%', textAlign: 'center'
        }}>
          <div style={{ fontSize: '50px', marginBottom: '20px' }}>🔒</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', marginBottom: '10px' }}>
            Admin Access
          </h1>
          <p style={{ color: '#bec8d1', marginBottom: '30px', fontSize: '14px' }}>
            Area terbatas. Masukkan password untuk melanjutkan.
          </p>
          <form onSubmit={handleLogin}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoFocus
              style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: '#0e0e0e', color: 'white', fontSize: '16px', marginBottom: '15px',
                outline: 'none', textAlign: 'center', boxSizing: 'border-box' }} />
            {error && (
              <div style={{ color: '#ff525f', fontSize: '14px', marginBottom: '15px', padding: '10px',
                backgroundColor: 'rgba(255,82,95,0.1)', borderRadius: '8px' }}>{error}</div>
            )}
            <button type="submit" disabled={isAuthenticating} style={{ width: '100%', padding: '15px', borderRadius: '8px', border: 'none',
              backgroundColor: '#049dd9', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              {isAuthenticating ? '⏳ Memproses...' : '🔑 Masuk'}
            </button>
          </form>
          <Link href="/" style={{ display: 'inline-block', marginTop: '20px', color: '#bec8d1',
            textDecoration: 'none', fontSize: '14px' }}>← Kembali ke Website</Link>
        </div>
      </div>
    );
  }

  // ========== STYLES ==========
  const inputStyle = {
    width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: '#0e0e0e', color: 'white', fontSize: '14px', marginBottom: '15px',
    outline: 'none', boxSizing: 'border-box',
  };

  const textareaStyle = { ...inputStyle, minHeight: '100px', resize: 'vertical' };

  const buttonStyle = {
    padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '14px', backgroundColor: '#049dd9', color: 'white',
  };

  const deleteButtonStyle = {
    padding: '5px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer',
    fontWeight: 'bold', fontSize: '12px', backgroundColor: '#ff525f', color: 'white',
  };

  // ========== ADMIN PANEL ==========
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#131313', color: 'white', padding: 'clamp(30px, 8vw, 80px) 16px 40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>⚙️ Admin Panel</h1>
          <button onClick={handleLogout}
            style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'transparent', color: '#bec8d1', cursor: 'pointer', fontSize: '14px' }}>
            🚪 Logout
          </button>
        </div>

        {/* Notifikasi */}
        {message && (
          <div style={{
            backgroundColor: messageType === 'success' ? '#4ade80' : '#ff525f',
            color: messageType === 'success' ? 'black' : 'white',
            padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px'
          }}>{message}</div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', flexWrap: 'wrap' }}>
          {['data-diri', 'pengalaman', 'proyek', 'pendidikan', 'sertifikat'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                backgroundColor: activeTab === tab ? '#049dd9' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab ? 'white' : '#bec8d1', fontWeight: 'bold', textTransform: 'capitalize' }}>
              {tab === 'data-diri' ? '👤 Data Diri' : tab === 'pengalaman' ? '💼 Pengalaman' : tab === 'proyek' ? '🧩 Proyek' : tab === 'pendidikan' ? '🎓 Pendidikan' : '📜 Sertifikat'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: 'clamp(16px, 5vw, 30px)' }}>
          
          {/* ========== DATA DIRI ========== */}
          {activeTab === 'data-diri' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '25px' }}>👤 Edit Data Diri</h2>
              
              {/* Upload Foto Profil */}
              <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'rgba(4,157,217,0.05)', borderRadius: '12px', border: '1px solid rgba(4,157,217,0.2)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '15px', color: '#83cfff' }}>📸 Foto Profil</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden',
                    border: '3px solid #049dd9', backgroundColor: '#0e0e0e', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {previewFoto ? (
                      <img src={previewFoto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE1MCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiMwZTBlMGUiLz48dGV4dCB4PSI3NSIgeT0iODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNjY2MiIGZvbnQtc2l6ZT0iNDAiPuKaoDwvdGV4dD48L3N2Zz4='; }} />
                    ) : (
                      <span style={{ fontSize: '40px', color: '#666' }}>📷</span>
                    )}
                  </div>
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadFoto} style={{ display: 'none' }} />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                      style={{ ...buttonStyle, backgroundColor: '#049dd9', marginBottom: '10px', width: '100%' }}>
                      {uploading ? '⏳ Mengupload...' : '📤 Pilih & Upload Foto'}
                    </button>
                    <p style={{ color: '#bec8d1', fontSize: '12px' }}>Format: JPG, PNG, GIF, WebP • Maks: 5MB</p>
                    <div style={{ marginTop: '15px' }}>
                      <label style={{ color: '#bec8d1', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Atau masukkan URL foto:</label>
                      <input style={{ ...inputStyle, marginBottom: '0' }} placeholder="https://example.com/foto.jpg"
                        value={config.foto_profil}
                        onChange={(e) => { setConfig({...config, foto_profil: e.target.value}); setPreviewFoto(e.target.value); }} />
                    </div>
                  </div>
                </div>
              </div>

              <label style={{ color: '#bec8d1', fontSize: '14px', display: 'block', marginBottom: '5px', marginTop: '15px' }}>Nama Lengkap</label>
              <input style={inputStyle} value={config.nama} onChange={e => setConfig({...config, nama: e.target.value})} placeholder="Nama Anda" />
              
              <label style={{ color: '#bec8d1', fontSize: '14px', display: 'block', marginBottom: '5px' }}>Tentang Saya</label>
              <textarea style={textareaStyle} value={config.tentang} onChange={e => setConfig({...config, tentang: e.target.value})} placeholder="Deskripsi singkat..." />
              
              <label style={{ color: '#bec8d1', fontSize: '14px', display: 'block', marginBottom: '5px' }}>Email</label>
              <input style={inputStyle} type="email" value={config.email} onChange={e => setConfig({...config, email: e.target.value})} placeholder="email@domain.com" />
              
              <label style={{ color: '#bec8d1', fontSize: '14px', display: 'block', marginBottom: '5px' }}>LinkedIn URL</label>
              <input style={inputStyle} value={config.linkedin} onChange={e => setConfig({...config, linkedin: e.target.value})} placeholder="https://linkedin.com/in/username" />
              
              <label style={{ color: '#bec8d1', fontSize: '14px', display: 'block', marginBottom: '5px' }}>GitHub URL</label>
              <input style={inputStyle} value={config.github} onChange={e => setConfig({...config, github: e.target.value})} placeholder="https://github.com/username" />
              
              <button style={{ ...buttonStyle, marginTop: '20px', width: '100%', padding: '15px' }} onClick={saveConfig} disabled={loading}>
                {loading ? '⏳ Menyimpan...' : '💾 Simpan Semua Perubahan'}
              </button>
            </div>
          )}

          {/* ========== PENGALAMAN ========== */}
          {activeTab === 'pengalaman' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '25px' }}>💼 Pengalaman Kerja</h2>
              <input style={inputStyle} placeholder="Tahun (contoh: 2022 - Sekarang)" value={formPengalaman.tahun} onChange={e => setFormPengalaman({...formPengalaman, tahun: e.target.value})} />
              <input style={inputStyle} placeholder="Posisi" value={formPengalaman.posisi} onChange={e => setFormPengalaman({...formPengalaman, posisi: e.target.value})} />
              <input style={inputStyle} placeholder="Perusahaan" value={formPengalaman.perusahaan} onChange={e => setFormPengalaman({...formPengalaman, perusahaan: e.target.value})} />
              <textarea style={textareaStyle} placeholder="Deskripsi pekerjaan" value={formPengalaman.deskripsi} onChange={e => setFormPengalaman({...formPengalaman, deskripsi: e.target.value})} />
              <button style={buttonStyle} onClick={savePengalaman} disabled={loading}>
                {loading ? '⏳ Menyimpan...' : '➕ Tambah Pengalaman'}
              </button>
              {pengalamanList.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', color: '#83cfff' }}>📋 Daftar ({pengalamanList.length})</h3>
                  {pengalamanList.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: '#0e0e0e', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}><strong style={{ color: '#83cfff' }}>{item.posisi}</strong> di {item.perusahaan} <small style={{ color: '#888' }}>({item.tahun})</small></div>
                      <button style={deleteButtonStyle} onClick={() => deletePengalaman(item.filename)}>🗑 Hapus</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'proyek' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '25px' }}>🧩 Proyek yang Pernah Dikerjakan</h2>
              <input style={inputStyle} placeholder="Nama proyek" value={formProyek.nama} onChange={e => setFormProyek({...formProyek, nama: e.target.value})} />
              <input style={inputStyle} placeholder="Tahun (contoh: 2024)" value={formProyek.tahun} onChange={e => setFormProyek({...formProyek, tahun: e.target.value})} />
              <textarea style={textareaStyle} placeholder="Deskripsi proyek" value={formProyek.deskripsi} onChange={e => setFormProyek({...formProyek, deskripsi: e.target.value})} />
              <input style={inputStyle} placeholder="Teknologi (opsional)" value={formProyek.teknologi} onChange={e => setFormProyek({...formProyek, teknologi: e.target.value})} />
              <button style={buttonStyle} onClick={saveProyek} disabled={loading}>{loading ? '⏳ Menyimpan...' : '➕ Tambah Proyek'}</button>
              {proyekList.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', color: '#83cfff' }}>📋 Daftar Proyek ({proyekList.length})</h3>
                  {proyekList.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: '#0e0e0e', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}><strong style={{ color: '#83cfff' }}>{item.nama}</strong> <small style={{ color: '#888' }}>({item.tahun})</small></div>
                      <button style={deleteButtonStyle} onClick={() => deleteProyek(item.filename)}>🗑 Hapus</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========== PENDIDIKAN ========== */}
          {activeTab === 'pendidikan' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '25px' }}>🎓 Pendidikan</h2>
              <input style={inputStyle} placeholder="Tahun (contoh: 2015 - 2019)" value={formPendidikan.tahun} onChange={e => setFormPendidikan({...formPendidikan, tahun: e.target.value})} />
              <input style={inputStyle} placeholder="Institusi" value={formPendidikan.institusi} onChange={e => setFormPendidikan({...formPendidikan, institusi: e.target.value})} />
              <input style={inputStyle} placeholder="Jurusan" value={formPendidikan.jurusan} onChange={e => setFormPendidikan({...formPendidikan, jurusan: e.target.value})} />
              <button style={buttonStyle} onClick={savePendidikan} disabled={loading}>
                {loading ? '⏳ Menyimpan...' : '➕ Tambah Pendidikan'}
              </button>
              {pendidikanList.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', color: '#83cfff' }}>📋 Daftar ({pendidikanList.length})</h3>
                  {pendidikanList.map((item, idx) => (
                    <div key={idx} style={{ backgroundColor: '#0e0e0e', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ minWidth: 0, overflowWrap: 'anywhere' }}><strong style={{ color: '#83cfff' }}>{item.institusi}</strong> - {item.jurusan} <small style={{ color: '#888' }}>({item.tahun})</small></div>
                      <button style={deleteButtonStyle} onClick={() => deletePendidikan(item.filename)}>🗑 Hapus</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========== SERTIFIKAT (DENGAN UPLOAD GAMBAR) ========== */}
          {activeTab === 'sertifikat' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '25px' }}>📜 Tambah Sertifikat Baru</h2>
              
              {/* Upload Gambar Sertifikat */}
              <div style={{ marginBottom: '25px', padding: '20px', backgroundColor: 'rgba(4,157,217,0.05)', borderRadius: '12px', border: '1px solid rgba(4,157,217,0.2)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '15px', color: '#83cfff' }}>🖼️ Upload Gambar Sertifikat</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Preview */}
                  <div style={{ width: 'min(200px, 100%)', height: '140px', borderRadius: '8px', overflow: 'hidden',
                    border: '2px dashed rgba(255,255,255,0.2)', backgroundColor: '#0e0e0e',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {formSertifikat.gambar ? (
                      <img src={formSertifikat.gambar} alt="Preview Sertifikat" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDIwMCAxNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNDAiIGZpbGw9IiMwZTBlMGUiLz48dGV4dCB4PSIxMDAiIHk9Ijc1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE2Ij7wn5OOIFByZXZpZXc8L3RleHQ+PC9zdmc+'; }} />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#666' }}>
                        <span style={{ fontSize: '30px' }}>📜</span>
                        <span style={{ fontSize: '12px', marginTop: '5px' }}>Belum ada gambar</span>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                    <input ref={sertifikatFileRef} type="file" accept="image/*" onChange={handleUploadSertifikat} style={{ display: 'none' }} />
                    <button onClick={() => sertifikatFileRef.current?.click()} disabled={uploadingSertifikat}
                      style={{ ...buttonStyle, backgroundColor: '#049dd9', marginBottom: '10px', width: '100%' }}>
                      {uploadingSertifikat ? '⏳ Mengupload...' : '📤 Upload Gambar Sertifikat'}
                    </button>
                    <p style={{ color: '#bec8d1', fontSize: '12px', marginBottom: '10px' }}>Format: JPG, PNG, GIF, WebP • Maks: 5MB</p>
                    <label style={{ color: '#bec8d1', fontSize: '13px', display: 'block', marginBottom: '5px' }}>Atau masukkan URL manual:</label>
                    <input style={{ ...inputStyle, marginBottom: '0' }} placeholder="https://example.com/sertifikat.jpg"
                      value={formSertifikat.gambar}
                      onChange={(e) => setFormSertifikat({...formSertifikat, gambar: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Form Sertifikat */}
              <label style={{ color: '#bec8d1', fontSize: '14px', display: 'block', marginBottom: '5px' }}>Nama Sertifikat</label>
              <input style={inputStyle} placeholder="Contoh: CISSP, CCNA, CEH" value={formSertifikat.nama} onChange={e => setFormSertifikat({...formSertifikat, nama: e.target.value})} />
              
              <label style={{ color: '#bec8d1', fontSize: '14px', display: 'block', marginBottom: '5px' }}>Tahun Terbit</label>
              <input style={inputStyle} placeholder="Contoh: 2023" value={formSertifikat.tahun_terbit} onChange={e => setFormSertifikat({...formSertifikat, tahun_terbit: e.target.value})} />
              
              <button style={{ ...buttonStyle, width: '100%', padding: '15px', marginTop: '10px' }} onClick={saveSertifikat} disabled={loading}>
                {loading ? '⏳ Menyimpan...' : '➕ Tambah Sertifikat'}
              </button>

              {/* List Sertifikat */}
              {sertifikatList.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', color: '#83cfff' }}>📋 Daftar Sertifikat ({sertifikatList.length})</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: '15px' }}>
                    {sertifikatList.map((item, idx) => (
                      <div key={idx} style={{ backgroundColor: '#0e0e0e', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <img src={item.gambar} alt={item.nama} style={{ width: '100%', height: '120px', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiMwZTBlMGUiLz48dGV4dCB4PSIxNTAiIHk9IjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjIwIj7wn5OOIE5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='; }} />
                        <div style={{ padding: '10px' }}>
                          <strong style={{ color: '#83cfff', fontSize: '13px', display: 'block', marginBottom: '4px' }}>{item.nama}</strong>
                          <small style={{ color: '#888' }}>{item.tahun_terbit}</small>
                          <button style={{ ...deleteButtonStyle, marginTop: '8px', width: '100%' }} onClick={() => deleteSertifikat(item.filename)}>🗑 Hapus</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div style={{ marginTop: '30px', textAlign: 'center', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ display: 'inline-block', padding: '12px 30px', backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>👀 Lihat Website</Link>
          <button onClick={async () => {
            const results = await Promise.all([loadConfig(), loadPengalaman(), loadProyek(), loadPendidikan(), loadSertifikat()]);
            if (results.every(Boolean)) showMessage('✅ Data direfresh!', 'success');
          }}
            style={{ padding: '12px 30px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>🔄 Refresh Data</button>
        </div>
      </div>
    </div>
  );
}