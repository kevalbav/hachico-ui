// hachico-ui/app/reference-corner/page.tsx
"use client";

import { useState, useEffect } from 'react';

interface Reference {
  id: string;
  url: string;
  note: string | null;
  title: string | null;
  platform: string | null;
  tags: string[];
  created_at: string;
}

export default function ReferenceCornerPage() {
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [references, setReferences] = useState<Reference[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [editingId, setEditingNoteId] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Load references on page load
  const fetchReferences = async () => {
    try {
      const response = await fetch('/api/hachi/references/');
      if (response.ok) {
        const result = await response.json();
        setReferences(result.references || []);
      }
    } catch (error) {
      console.error('Error loading references:', error);
    } finally {
      setLoadingRefs(false);
    }
  };

  // Load available tags
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/hachi/references/tags');
      if (response.ok) {
        const result = await response.json();
        setAvailableTags(result.tags || []);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  useEffect(() => {
    fetchReferences();
    fetchTags();
  }, []);

  // Update reference tags/note
  const updateReference = async (id: string, updates: {note?: string, tags?: string[]}) => {
    try {
      const response = await fetch(`/api/hachi/references/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        fetchReferences(); // Refresh the list
        setEditingNoteId(null);
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  // Get unique platforms for filter buttons
  const platforms = Array.from(new Set(references.map(ref => ref.platform).filter((platform): platform is string => Boolean(platform))));
  
  // Filter references by selected platform
  const filteredReferences = selectedPlatform === 'all' 
    ? references 
    : references.filter(ref => ref.platform === selectedPlatform);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/hachi/references/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, note }),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`✅ Saved! Platform: ${result.reference.platform}`);
        setUrl('');
        setNote('');
        // Refresh the list
        fetchReferences();
      } else {
        setMessage('❌ Failed to save reference');
      }
    } catch (error) {
      setMessage('❌ Error saving reference');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>📎 Reference Corner</h1>
        <p style={{ color: 'var(--warm-text-secondary)' }}>Save and organize your inspiration from across the web</p>
      </div>
      
      {/* Save Form */}
      <div style={{ 
        background: 'var(--warm-card)', 
        border: '1px solid var(--warm-border)', 
        borderRadius: '16px', 
        boxShadow: 'var(--shadow-card)',
        padding: '24px', 
        marginBottom: '32px' 
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <input
            type="text"
            placeholder="Paste any link here (YouTube, Instagram, TikTok, articles...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ 
              border: '1px solid var(--warm-border)', 
              borderRadius: '12px', 
              background: '#fff', 
              padding: '16px', 
              fontSize: '16px', 
              outline: 'none'
            } as React.CSSProperties}
            disabled={loading}
          />
          
          <input
            type="text"
            placeholder="Why are you saving this? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ 
              border: '1px solid var(--warm-border)', 
              borderRadius: '12px', 
              background: '#fff', 
              padding: '12px', 
              fontSize: '14px', 
              outline: 'none'
            } as React.CSSProperties}
            disabled={loading}
          />
          
          <button
            type="submit"
            disabled={loading || !url}
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading || !url ? 'not-allowed' : 'pointer',
              textDecoration: 'none',
              transition: '0.2s',
              background: loading || !url ? '#fff' : 'var(--warm-text-primary)',
              border: loading || !url ? '1px solid var(--warm-border)' : 'none',
              color: loading || !url ? 'var(--warm-text-primary)' : '#fff',
              opacity: loading || !url ? 0.6 : 1,
              width: '100%'
            } as React.CSSProperties}
          >
            {loading ? 'Saving...' : '💾 Save Reference'}
          </button>
        </form>
        
        {message && (
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: 'var(--green-progress)', 
            color: 'white', 
            borderRadius: '12px',
            opacity: '0.9'
          }}>
            {message}
          </div>
        )}
      </div>

      {/* Saved References */}
      <div className="hc-card">
          <div style={{ padding: '24px', borderBottom: '1px solid var(--warm-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Your Saved References</h2>
              <p style={{ color: 'var(--warm-text-secondary)', fontSize: '14px', margin: 0 }}>
                {filteredReferences.length} of {references.length} shown
              </p>
            </div>
            
            {/* Platform Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
              <button
                onClick={() => setSelectedPlatform('all')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: selectedPlatform === 'all' ? '2px solid var(--warm-accent)' : '1px solid var(--warm-border)',
                  cursor: 'pointer',
                  background: selectedPlatform === 'all' ? '#fff78a33' : '#ffffff',
                  color: 'var(--warm-text-primary)',
                  transition: 'all 0.2s'
                } as React.CSSProperties}
              >
                All ({references.length})
              </button>
              {platforms.map(platform => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: selectedPlatform === platform ? '2px solid var(--warm-accent)' : '1px solid var(--warm-border)',
                    cursor: 'pointer',
                    background: selectedPlatform === platform ? '#fff78a33' : '#ffffff',
                    color: 'var(--warm-text-primary)',
                    transition: 'all 0.2s'
                  } as React.CSSProperties}
                >
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '50%',
                    backgroundColor: 
                      platform === 'youtube' ? '#FF0000' :
                      platform === 'instagram' ? '#E4405F' :
                      platform === 'tiktok' ? '#000000' :
                      platform === 'twitter' ? '#1DA1F2' :
                      platform === 'linkedin' ? '#0077B5' :
                      '#9CA3AF'
                  }}></div>
                  {platform.charAt(0).toUpperCase() + platform.slice(1)} ({references.filter(r => r.platform === platform).length})
                </button>
              ))}
            </div>
          </div>
        
        <div style={{ padding: '24px' }}>
          {loadingRefs ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                border: '2px solid var(--warm-border)', 
                borderTop: '2px solid var(--warm-text-primary)',
                borderRadius: '50%',
                margin: '0 auto 8px',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: 'var(--warm-text-secondary)' }}>Loading your references...</p>
            </div>
          ) : references.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔗</div>
              <p style={{ color: 'var(--warm-text-secondary)', marginBottom: '8px' }}>No references saved yet</p>
              <p style={{ color: 'var(--warm-text-secondary)', fontSize: '14px' }}>Start building your inspiration library above!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredReferences.map((ref) => (
                <div key={ref.id} style={{ 
                  border: '1px solid var(--warm-border)', 
                  borderRadius: '12px', 
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ 
                      width: '12px', 
                      height: '12px', 
                      borderRadius: '50%', 
                      marginTop: '4px',
                      backgroundColor: 
                        ref.platform === 'youtube' ? '#ff0000' :
                        ref.platform === 'instagram' ? '#E4405F' :
                        ref.platform === 'tiktok' ? '#000000' :
                        ref.platform === 'twitter' ? '#1DA1F2' :
                        ref.platform === 'linkedin' ? '#0077B5' :
                        'var(--warm-text-secondary)'
                    }}></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <a 
                        href={ref.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: 'var(--warm-text-primary)', 
                          fontWeight: 600, 
                          textDecoration: 'none',
                          display: 'block',
                          marginBottom: '4px',
                          wordBreak: 'break-word'
                        } as React.CSSProperties}
                        onMouseOver={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'underline'}
                        onMouseOut={(e) => (e.target as HTMLAnchorElement).style.textDecoration = 'none'}
                      >
                        {ref.url.length > 60 ? `${ref.url.substring(0, 60)}...` : ref.url}
                      </a>
                      
                      {/* Editable Note */}
                      {editingId === ref.id ? (
                        <input
                          type="text"
                          defaultValue={ref.note || ''}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateReference(ref.id, {note: e.currentTarget.value});
                            } else if (e.key === 'Escape') {
                              setEditingId(null);
                            }
                          }}
                          onBlur={(e) => updateReference(ref.id, {note: e.currentTarget.value})}
                          autoFocus
                          style={{ 
                            fontSize: '14px', 
                            margin: '0 0 8px 0',
                            padding: '4px 8px',
                            border: '1px solid var(--warm-accent)',
                            borderRadius: '4px',
                            width: '100%'
                          } as React.CSSProperties}
                        />
                      ) : (
                        <p 
                          onClick={() => setEditingId(ref.id)}
                          style={{ 
                            color: 'var(--warm-text-primary)', 
                            fontSize: '14px', 
                            margin: '0 0 8px 0',
                            lineHeight: '1.5',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background: ref.note ? 'transparent' : '#f8f8f8',
                            border: '1px solid transparent'
                          } as React.CSSProperties}
                        >
                          {ref.note || 'Click to add note...'}
                        </p>
                      )}

                      {/* Tags Section */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--warm-text-secondary)', flexWrap: 'wrap' }}>
                        {/* Platform Tag */}
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderRadius: '999px',
                          padding: '4px 8px',
                          fontSize: '11px',
                          color: 'var(--warm-text-secondary)',
                          background: '#f3f3ef'
                        }}>
                          {ref.platform}
                        </span>
                        
                        {/* User Tags with Remove */}
                        {ref.tags && ref.tags.length > 0 && ref.tags.map(tag => (
                          <span key={tag} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            borderRadius: '999px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            background: '#fff78a33',
                            color: 'var(--warm-text-primary)',
                            border: '1px solid var(--warm-accent)'
                          }}>
                            {tag}
                            <button
                              onClick={() => {
                                const newTags = ref.tags.filter(t => t !== tag);
                                updateReference(ref.id, {tags: newTags});
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--warm-text-secondary)',
                                cursor: 'pointer',
                                padding: '0',
                                marginLeft: '2px',
                                fontSize: '12px',
                                lineHeight: '1'
                              } as React.CSSProperties}
                              title="Remove tag"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        
                        {/* Add Tag Dropdown */}
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              const currentTags = ref.tags || [];
                              if (!currentTags.includes(e.target.value)) {
                                updateReference(ref.id, {tags: [...currentTags, e.target.value]});
                              }
                              e.target.value = ''; // Reset dropdown
                            }
                          }}
                          style={{
                            background: 'white',
                            border: '1px solid var(--warm-border)',
                            borderRadius: '999px',
                            padding: '3px 8px',
                            fontSize: '11px',
                            color: 'var(--warm-text-secondary)',
                            cursor: 'pointer'
                          } as React.CSSProperties}
                        >
                          <option value="">+ add tag</option>
                          {availableTags
                            .filter(tag => !ref.tags?.includes(tag))
                            .map(tag => (
                              <option key={tag} value={tag}>{tag}</option>
                            ))}
                        </select>
                        
                        <span>{new Date(ref.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}