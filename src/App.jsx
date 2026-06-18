import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const CATEGORIES = ["Mains", "Sides & Comfort", "Desserts & Baked Goods", "Drinks", "Other"];

// Softer pastel palette
const AVATAR_COLORS = ["#D4785A", "#7B9E87", "#9B8EC4", "#C9963A", "#5B95B0", "#B07090"];

const T = {
  // Brand
  cream:   "#FDF6EE",
  parchment: "#F5EDE0",
  peach:   "#D4785A",
  peachLight: "#FAEEE9",
  sage:    "#7B9E87",
  sageLight: "#EBF3EE",
  lavender: "#9B8EC4",
  lavenderLight: "#F0EEF9",
  // Text
  ink:     "#3D2B1F",
  inkMid:  "#7A6255",
  inkLight:"#A8978A",
  // Surfaces
  bg:      "#FDF9F4",
  card:    "#FFFFFF",
  border:  "#EDE5D8",
  borderLight: "#F5EDE0",
};

function getCategoryColor(cat) {
  return { "Mains": T.peach, "Sides & Comfort": T.sage, "Desserts & Baked Goods": T.lavender, "Drinks": "#5B95B0", "Other": "#B0A090" }[cat] || T.peach;
}
function getCategoryLight(cat) {
  return { "Mains": T.peachLight, "Sides & Comfort": T.sageLight, "Desserts & Baked Goods": T.lavenderLight, "Drinks": "#E8F2F8", "Other": "#F0EBE5" }[cat] || T.peachLight;
}

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
function getAvatarColor(name) {
  let hash = 0;
  for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ name, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: getAvatarColor(name),
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 700, fontSize: size * 0.36, flexShrink: 0,
      fontFamily: "'Nunito', sans-serif", letterSpacing: "0.02em"
    }}>
      {getInitials(name)}
    </div>
  );
}

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
}

// ── Styles ──────────────────────────────────────────────────────────────────

const S = {
  app: { fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: T.bg, color: T.ink },
  header: {
    background: T.cream, borderBottom: `1px solid ${T.border}`,
    position: "sticky", top: 0, zIndex: 100,
  },
  headerInner: {
    maxWidth: 900, margin: "0 auto", padding: "0 20px",
    display: "flex", alignItems: "center", justifyContent: "space-between", height: 60,
  },
  logo: { fontFamily: "'Georgia', serif", fontSize: 22, fontWeight: 400, letterSpacing: "0.03em", color: T.peach, margin: 0 },
  navBtn: (active) => ({
    background: active ? T.peachLight : "transparent",
    border: "none", color: active ? T.peach : T.inkMid, padding: "6px 14px",
    borderRadius: 24, cursor: "pointer", fontSize: 14, fontFamily: "'Nunito', sans-serif",
    fontWeight: active ? 700 : 500, transition: "all 0.15s",
  }),
  main: { maxWidth: 900, margin: "0 auto", padding: "28px 20px 100px" },
  sectionTitle: { fontFamily: "'Georgia', serif", fontSize: 24, fontWeight: 400, margin: "0 0 4px", color: T.ink },
  sectionSub: { fontSize: 14, color: T.inkLight, fontFamily: "'Nunito', sans-serif", margin: "0 0 20px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 },
  card: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 18, overflow: "hidden", cursor: "pointer", transition: "box-shadow 0.15s" },
  cardBody: { padding: "16px" },
  cardCategory: (cat) => ({ fontSize: 11, fontFamily: "'Nunito', sans-serif", color: getCategoryColor(cat), fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }),
  cardTitle: { fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 400, margin: "0 0 7px", lineHeight: 1.35, color: T.ink },
  cardDesc: { fontSize: 13, color: T.inkMid, fontFamily: "'Nunito', sans-serif", lineHeight: 1.5, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${T.borderLight}` },
  btn: (variant = "primary") => ({
    padding: variant === "sm" ? "6px 16px" : "10px 22px",
    borderRadius: 24, cursor: "pointer", fontFamily: "'Nunito', sans-serif",
    fontSize: variant === "sm" ? 13 : 14, fontWeight: 700,
    background: variant === "ghost" ? "transparent" : variant === "outline" ? T.card : T.peach,
    color: variant === "ghost" ? T.inkLight : variant === "outline" ? T.peach : "#fff",
    border: variant === "outline" ? `2px solid ${T.peach}` : "none",
    transition: "opacity 0.15s",
  }),
  searchBox: {
    border: `1.5px solid ${T.border}`, borderRadius: 24, padding: "8px 16px", fontSize: 14,
    fontFamily: "'Nunito', sans-serif", width: "100%", maxWidth: 260, outline: "none",
    background: T.card, color: T.ink,
  },
  filterPill: (active) => ({
    padding: "5px 14px", borderRadius: 24, fontSize: 13, cursor: "pointer",
    fontFamily: "'Nunito', sans-serif", fontWeight: active ? 700 : 500,
    border: active ? `2px solid ${T.peach}` : `1.5px solid ${T.border}`,
    background: active ? T.peachLight : T.card, color: active ? T.peach : T.inkMid,
    transition: "all 0.12s", whiteSpace: "nowrap",
  }),
  modal: {
    position: "fixed", inset: 0, background: "rgba(61,43,31,0.45)", zIndex: 200,
    display: "flex", alignItems: "flex-start", justifyContent: "center",
    padding: "40px 16px", overflowY: "auto",
  },
  modalBox: {
    background: T.bg, borderRadius: 20, width: "100%", maxWidth: 620,
    maxHeight: "90vh", overflowY: "auto", border: `1px solid ${T.border}`,
    boxShadow: "0 8px 40px rgba(61,43,31,0.12)",
  },
  modalHeader: { padding: "24px 24px 16px", borderBottom: `1px solid ${T.border}` },
  modalBody: { padding: "22px 24px" },
  label: { fontSize: 13, fontWeight: 700, fontFamily: "'Nunito', sans-serif", color: T.inkMid, display: "block", marginBottom: 6 },
  input: { width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "9px 13px", fontSize: 14, fontFamily: "'Nunito', sans-serif", outline: "none", background: T.card, boxSizing: "border-box", color: T.ink },
  textarea: { width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "9px 13px", fontSize: 13, fontFamily: "'Nunito', sans-serif", outline: "none", background: T.card, resize: "vertical", lineHeight: 1.6, boxSizing: "border-box", color: T.ink },
  select: { width: "100%", border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "9px 13px", fontSize: 14, fontFamily: "'Nunito', sans-serif", outline: "none", background: T.card, boxSizing: "border-box", color: T.ink },
  divider: { border: "none", borderTop: `1px solid ${T.border}`, margin: "18px 0" },
  statNum: { fontSize: 26, fontFamily: "'Georgia', serif", color: T.ink },
  statLabel: { fontSize: 11, color: T.inkLight, fontFamily: "'Nunito', sans-serif", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 },
};

// Bottom nav config
const NAV_ITEMS = [
  { id: "home",      label: "Home",    icon: "🏠" },
  { id: "browse",    label: "Browse",  icon: "🔍" },
  { id: "mine",      label: "Mine",    icon: "👨‍🍳" },
  { id: "favorites", label: "Saved",   icon: "❤️" },
];

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();

  const [currentUser, setCurrentUser] = useState(() => {
    try { return localStorage.getItem("wtf_user") || null; } catch { return null; }
  });

  const [view, setView] = useState("home");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterAuthor, setFilterAuthor] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showJoin, setShowJoin] = useState(() => {
    try { return !localStorage.getItem("wtf_user"); } catch { return true; }
  });
  const [newComment, setNewComment] = useState("");
  const [newRecipe, setNewRecipe] = useState({
    title: "", category: "Mains", description: "", ingredients: "", steps: "", prepTime: "", cookTime: ""
  });

  async function fetchRecipes() {
    const { data, error } = await supabase
      .from("recipes")
      .select("*, likes(user_name), comments(id, author, text, created_at), ratings(user_name, stars)")
      .order("created_at", { ascending: false });
    if (data) {
      setRecipes(data);
    } else if (error) {
      // ratings table not yet created — fall back without it
      const { data: fallback } = await supabase
        .from("recipes")
        .select("*, likes(user_name), comments(id, author, text, created_at)")
        .order("created_at", { ascending: false });
      if (fallback) setRecipes(fallback.map(r => ({ ...r, ratings: [] })));
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchRecipes();
    const channel = supabase
      .channel("wtf-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "recipes" }, fetchRecipes)
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, fetchRecipes)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, fetchRecipes)
      .on("postgres_changes", { event: "*", schema: "public", table: "ratings" }, fetchRecipes)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    if (selectedRecipe) {
      const fresh = recipes.find(r => r.id === selectedRecipe.id);
      if (fresh) setSelectedRecipe(fresh);
    }
  }, [recipes]);

  function joinAs(name) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCurrentUser(trimmed);
    try { localStorage.setItem("wtf_user", trimmed); } catch {}
    setShowJoin(false);
  }

  function logout() {
    try { localStorage.removeItem("wtf_user"); } catch {}
    setCurrentUser(null);
    setShowJoin(true);
  }

  async function addRecipe() {
    if (!newRecipe.title.trim() || !currentUser) return;
    await supabase.from("recipes").insert({
      title: newRecipe.title.trim(), category: newRecipe.category,
      description: newRecipe.description, ingredients: newRecipe.ingredients,
      steps: newRecipe.steps, prep_time: newRecipe.prepTime,
      cook_time: newRecipe.cookTime, author: currentUser,
    });
    setNewRecipe({ title: "", category: "Mains", description: "", ingredients: "", steps: "", prepTime: "", cookTime: "" });
    setShowAddRecipe(false);
  }

  async function saveEditedRecipe(id, fields) {
    await supabase.from("recipes").update({
      title: fields.title.trim(),
      category: fields.category,
      description: fields.description,
      ingredients: fields.ingredients,
      steps: fields.steps,
      prep_time: fields.prepTime,
      cook_time: fields.cookTime,
    }).eq("id", id);
    setEditingRecipe(null);
  }

  async function toggleLike(recipeId) {
    if (!currentUser) return;
    const recipe = recipes.find(r => r.id === recipeId);
    const liked = recipe?.likes?.some(l => l.user_name === currentUser);
    if (liked) {
      await supabase.from("likes").delete().match({ recipe_id: recipeId, user_name: currentUser });
    } else {
      await supabase.from("likes").insert({ recipe_id: recipeId, user_name: currentUser });
    }
  }

  async function rateRecipe(recipeId, stars) {
    if (!currentUser) return;
    await supabase.from("ratings").upsert({ recipe_id: recipeId, user_name: currentUser, stars }, { onConflict: "recipe_id,user_name" });
  }

  async function addComment(recipeId) {
    if (!newComment.trim() || !currentUser) return;
    await supabase.from("comments").insert({ recipe_id: recipeId, author: currentUser, text: newComment.trim() });
    setNewComment("");
  }

  const allAuthors = Array.from(new Set(recipes.map(r => r.author)));
  const filtered = recipes.filter(r => {
    const matchCat = filterCategory === "All" || r.category === filterCategory;
    const matchAuthor = filterAuthor === "All" || r.author === filterAuthor;
    const matchSearch = !searchQ ||
      r.title.toLowerCase().includes(searchQ.toLowerCase()) ||
      r.author.toLowerCase().includes(searchQ.toLowerCase()) ||
      (r.description || "").toLowerCase().includes(searchQ.toLowerCase());
    return matchCat && matchAuthor && matchSearch;
  });
  const myRecipes = recipes.filter(r => r.author === currentUser);
  const myFavorites = recipes.filter(r => r.likes?.some(l => l.user_name === currentUser));

  if (showJoin) return <JoinScreen onJoin={joinAs} />;
  if (loading) return (
    <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ color: T.inkLight, fontSize: 15 }}>Loading recipes…</div>
    </div>
  );

  return (
    <div style={S.app}>
      {/* ── Header ── */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <h1 style={S.logo}>What The Fork</h1>

          {/* Desktop nav */}
          {!isMobile && (
            <nav style={{ display: "flex", gap: 2 }}>
              {NAV_ITEMS.map(({ id, label }) => (
                <button key={id} style={S.navBtn(view === id)} onClick={() => setView(id)}>{label}</button>
              ))}
            </nav>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {!isMobile && (
              <button style={{ ...S.btn(), padding: "7px 18px", fontSize: 13 }} onClick={() => setShowAddRecipe(true)}>
                + Add recipe
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar name={currentUser} size={32} />
              {!isMobile && <span style={{ fontSize: 13, color: T.inkMid, fontWeight: 600 }}>{currentUser}</span>}
              <button onClick={logout} title="Sign out"
                style={{ background: "none", border: "none", color: T.inkLight, fontSize: 16, cursor: "pointer", padding: "0 2px" }}>
                ⏏
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main style={{ ...S.main, paddingBottom: isMobile ? 80 : 48 }}>
        {view === "home" && <HomeView recipes={recipes} currentUser={currentUser} onOpenRecipe={setSelectedRecipe} onToggleLike={toggleLike} onAdd={() => setShowAddRecipe(true)} isMobile={isMobile} />}
        {view === "browse" && (
          <BrowseView
            recipes={filtered} allRecipes={recipes}
            filterCategory={filterCategory} setFilterCategory={setFilterCategory}
            filterAuthor={filterAuthor} setFilterAuthor={setFilterAuthor}
            allAuthors={allAuthors} searchQ={searchQ} setSearchQ={setSearchQ}
            currentUser={currentUser} onOpenRecipe={setSelectedRecipe} onToggleLike={toggleLike}
            isMobile={isMobile}
          />
        )}
        {view === "mine" && <MineView recipes={myRecipes} currentUser={currentUser} onOpenRecipe={setSelectedRecipe} onToggleLike={toggleLike} onAdd={() => setShowAddRecipe(true)} isMobile={isMobile} />}
        {view === "favorites" && <FavoritesView recipes={myFavorites} currentUser={currentUser} onOpenRecipe={setSelectedRecipe} onToggleLike={toggleLike} isMobile={isMobile} />}
      </main>

      {/* ── Mobile bottom nav ── */}
      {isMobile && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
          background: T.cream, borderTop: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-around", alignItems: "center",
          padding: "6px 0 10px", boxShadow: "0 -2px 12px rgba(61,43,31,0.07)",
        }}>
          {NAV_ITEMS.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setView(id)} style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              color: view === id ? T.peach : T.inkLight,
              fontFamily: "'Nunito', sans-serif", fontSize: 10, fontWeight: view === id ? 700 : 500,
              padding: "4px 12px", borderRadius: 12,
              background: view === id ? T.peachLight : "transparent",
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              {label}
            </button>
          ))}
          <button onClick={() => setShowAddRecipe(true)} style={{
            background: T.peach, border: "none", borderRadius: "50%", width: 44, height: 44,
            color: "#fff", fontSize: 22, cursor: "pointer", display: "flex",
            alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(212,120,90,0.4)",
            marginBottom: 4,
          }}>+</button>
        </nav>
      )}

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe} currentUser={currentUser}
          onClose={() => setSelectedRecipe(null)}
          onLike={() => toggleLike(selectedRecipe.id)}
          onComment={() => addComment(selectedRecipe.id)}
          onRate={(stars) => rateRecipe(selectedRecipe.id, stars)}
          newComment={newComment} setNewComment={setNewComment}
          liked={selectedRecipe.likes?.some(l => l.user_name === currentUser)}
          onEdit={() => {
            setEditingRecipe({
              id: selectedRecipe.id,
              fields: {
                title: selectedRecipe.title,
                category: selectedRecipe.category,
                description: selectedRecipe.description || "",
                ingredients: selectedRecipe.ingredients || "",
                steps: selectedRecipe.steps || "",
                prepTime: selectedRecipe.prep_time || "",
                cookTime: selectedRecipe.cook_time || "",
              }
            });
            setSelectedRecipe(null);
          }}
        />
      )}

      {showAddRecipe && (
        <AddRecipeModal recipe={newRecipe} setRecipe={setNewRecipe}
          onClose={() => setShowAddRecipe(false)} onSave={addRecipe} />
      )}

      {editingRecipe && (
        <AddRecipeModal
          recipe={editingRecipe.fields}
          setRecipe={updater => setEditingRecipe(prev => ({ ...prev, fields: typeof updater === "function" ? updater(prev.fields) : updater }))}
          onClose={() => setEditingRecipe(null)}
          onSave={() => saveEditedRecipe(editingRecipe.id, editingRecipe.fields)}
          isEditing
        />
      )}
    </div>
  );
}

// ── Join Screen ──────────────────────────────────────────────────────────────

function JoinScreen({ onJoin }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState("name");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already stored, offer one-tap continue
  const storedUser = (() => { try { return localStorage.getItem("wtf_user"); } catch { return null; } })();

  async function handleNameNext() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true); setError("");
    const { data } = await supabase.from("users").select("name").eq("name", trimmed).maybeSingle();
    setLoading(false);
    setStep(data ? "pin-return" : "pin-new");
  }

  async function handlePinSubmit() {
    const trimmed = name.trim();
    if (pin.length !== 4) { setError("PIN must be 4 digits."); return; }
    setLoading(true); setError("");
    if (step === "pin-new") {
      await supabase.from("users").insert({ name: trimmed, pin });
      onJoin(trimmed);
    } else {
      const { data } = await supabase.from("users").select("pin").eq("name", trimmed).maybeSingle();
      if (data?.pin === pin) { onJoin(trimmed); }
      else { setError("Wrong PIN. Try again."); setPin(""); }
    }
    setLoading(false);
  }

  const fieldStyle = {
    width: "100%", background: T.card, border: `1.5px solid ${T.border}`,
    borderRadius: 14, padding: "11px 16px", fontSize: 16, color: T.ink,
    fontFamily: "'Nunito', sans-serif", outline: "none", boxSizing: "border-box", marginBottom: 12,
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg, #FDF0E4 0%, #F5E8D8 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 28, padding: 20 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52, fontFamily: "'Georgia', serif", color: T.peach, marginBottom: 6 }}>What The Fork</div>
        <div style={{ fontSize: 16, color: T.inkMid, fontFamily: "'Nunito', sans-serif", fontWeight: 500 }}>A shared cookbook for friends & family</div>
      </div>

      {/* One-tap continue for returning users */}
      {storedUser && step === "name" && (
        <div style={{ background: "#fff", borderRadius: 20, padding: "20px 24px", width: "100%", maxWidth: 360, boxShadow: "0 4px 24px rgba(212,120,90,0.1)", border: `2px solid ${T.peach}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <Avatar name={storedUser} size={40} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: T.ink }}>{storedUser}</div>
              <div style={{ fontSize: 12, color: T.inkLight }}>Signed in on this device</div>
            </div>
          </div>
          <button onClick={() => onJoin(storedUser)}
            style={{ ...S.btn(), width: "100%", padding: "11px", fontSize: 15 }}>
            Continue as {storedUser}
          </button>
          <button onClick={() => { try { localStorage.removeItem("wtf_user"); } catch {} window.location.reload(); }}
            style={{ width: "100%", background: "transparent", border: "none", color: T.inkLight, fontFamily: "'Nunito', sans-serif", fontSize: 13, marginTop: 8, cursor: "pointer" }}>
            Sign in as someone else
          </button>
        </div>
      )}

      {/* New sign-in form */}
      {(!storedUser || step !== "name") && (
        <div style={{ background: "#fff", borderRadius: 24, padding: "32px", width: "100%", maxWidth: 360, boxShadow: "0 4px 32px rgba(212,120,90,0.12)", border: `1px solid ${T.border}` }}>
          {step === "name" && (
            <>
              <p style={{ color: T.inkMid, fontSize: 14, fontFamily: "'Nunito', sans-serif", marginTop: 0, marginBottom: 20, lineHeight: 1.7 }}>
                Enter your name to join. You'll create a 4-digit PIN so you can sign in from any device.
              </p>
              <input style={fieldStyle} placeholder="Your name" value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleNameNext()}
                autoFocus />
              <button onClick={handleNameNext} disabled={loading || !name.trim()}
                style={{ ...S.btn(), width: "100%", padding: "12px", fontSize: 15, opacity: (loading || !name.trim()) ? 0.6 : 1 }}>
                {loading ? "Checking…" : "Continue →"}
              </button>
            </>
          )}

          {(step === "pin-new" || step === "pin-return") && (
            <>
              <p style={{ color: T.inkMid, fontSize: 14, fontFamily: "'Nunito', sans-serif", marginTop: 0, marginBottom: 16, lineHeight: 1.7 }}>
                {step === "pin-new"
                  ? <><strong style={{ color: T.ink }}>{name}</strong> — pick a 4-digit PIN you'll use from any device.</>
                  : <>Welcome back, <strong style={{ color: T.ink }}>{name}</strong>! Enter your PIN.</>}
              </p>
              <input style={{ ...fieldStyle, letterSpacing: "0.4em", textAlign: "center", fontSize: 24, fontWeight: 700 }}
                placeholder="••••" maxLength={4} value={pin} type="password" inputMode="numeric"
                onChange={e => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handlePinSubmit()}
                autoFocus />
              {error && <div style={{ color: "#C0554A", fontSize: 13, marginBottom: 10, marginTop: -6, fontFamily: "'Nunito', sans-serif" }}>{error}</div>}
              <button onClick={handlePinSubmit} disabled={loading || pin.length !== 4}
                style={{ ...S.btn(), width: "100%", padding: "12px", fontSize: 15, opacity: (loading || pin.length !== 4) ? 0.6 : 1 }}>
                {loading ? "Checking…" : step === "pin-new" ? "Set PIN & join 🍴" : "Sign in"}
              </button>
              <button onClick={() => { setStep("name"); setPin(""); setError(""); }}
                style={{ width: "100%", background: "transparent", border: "none", color: T.inkLight, fontFamily: "'Nunito', sans-serif", fontSize: 13, marginTop: 10, cursor: "pointer", fontWeight: 500 }}>
                ← Use a different name
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ── Recipe Card ──────────────────────────────────────────────────────────────

function avgRating(ratings) {
  if (!ratings?.length) return null;
  return ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
}

function StarDisplay({ value, size = 14 }) {
  if (value === null) return null;
  return (
    <span style={{ fontSize: size, letterSpacing: 1, lineHeight: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(value) ? "#F5C842" : "#DDD" }}>★</span>
      ))}
      <span style={{ fontSize: size - 2, color: T.inkLight, marginLeft: 3, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
        {value.toFixed(1)}
      </span>
    </span>
  );
}

function RecipeCard({ recipe, currentUser, onOpen, onLike }) {
  const liked = recipe.likes?.some(l => l.user_name === currentUser);
  const catColor = getCategoryColor(recipe.category);
  const avg = avgRating(recipe.ratings);
  return (
    <div style={S.card} onClick={() => onOpen(recipe)}>
      <div style={{ height: 7, background: catColor }} />
      <div style={S.cardBody}>
        <div style={S.cardCategory(recipe.category)}>{recipe.category}</div>
        <h3 style={S.cardTitle}>{recipe.title}</h3>
        {avg !== null && <div style={{ marginBottom: 6 }}><StarDisplay value={avg} size={13} /></div>}
        <p style={S.cardDesc}>{recipe.description}</p>
        <div style={S.cardFooter}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Avatar name={recipe.author} size={22} />
            <span style={{ fontSize: 12, color: T.inkLight, fontWeight: 600 }}>{recipe.author}</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={e => { e.stopPropagation(); onLike(recipe.id); }}
              style={{ background: liked ? T.peachLight : "none", border: "none", cursor: "pointer", fontSize: 12, color: liked ? T.peach : T.inkLight, padding: "3px 8px", borderRadius: 20, display: "flex", alignItems: "center", gap: 3, fontFamily: "'Nunito', sans-serif", fontWeight: 700 }}>
              {liked ? "♥" : "♡"} {recipe.likes?.length ?? 0}
            </button>
            <span style={{ fontSize: 12, color: T.inkLight, fontWeight: 600 }}>💬 {recipe.comments?.length ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cook Card ────────────────────────────────────────────────────────────────

function CookCard({ author, count, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      background: active ? T.peachLight : T.card,
      border: active ? `2px solid ${T.peach}` : `1.5px solid ${T.border}`,
      borderRadius: 16, padding: "14px 16px", cursor: "pointer", minWidth: 90,
      transition: "all 0.12s", fontFamily: "'Nunito', sans-serif",
    }}>
      <Avatar name={author} size={40} />
      <div style={{ fontSize: 13, fontWeight: 700, color: active ? T.peach : T.ink }}>{author}</div>
      <div style={{ fontSize: 11, color: T.inkLight, fontWeight: 600 }}>{count} recipe{count !== 1 ? "s" : ""}</div>
    </button>
  );
}

// ── Home View ────────────────────────────────────────────────────────────────

function HomeView({ recipes, currentUser, onOpenRecipe, onToggleLike, onAdd, isMobile }) {
  const recent = [...recipes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
  const popular = [...recipes].sort((a, b) => (b.likes?.length ?? 0) - (a.likes?.length ?? 0)).slice(0, 3);
  const authors = Array.from(new Set(recipes.map(r => r.author)));
  const authorCounts = authors.map(a => ({ author: a, count: recipes.filter(r => r.author === a).length }));

  return (
    <div>
      {/* Welcome strip */}
      <div style={{ background: T.peachLight, borderRadius: 18, padding: "22px 24px", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 22, fontWeight: 400, margin: "0 0 4px", color: T.ink }}>
            Welcome back, {currentUser} 👋
          </h2>
          <p style={{ fontSize: 14, color: T.inkMid, margin: 0, fontWeight: 500 }}>
            {recipes.length} recipes from {authors.length} {authors.length === 1 ? "cook" : "cooks"} at the table
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {[["Recipes", recipes.length], ["Your saves", recipes.filter(r => r.likes?.some(l => l.user_name === currentUser)).length]].map(([l, n]) => (
            <div key={l} style={{ background: "#fff", borderRadius: 12, padding: "10px 16px", textAlign: "center", border: `1px solid ${T.border}` }}>
              <div style={S.statNum}>{n}</div>
              <div style={S.statLabel}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* By Cook */}
      {authorCounts.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 400, margin: "0 0 4px" }}>The cooks</h3>
          <p style={{ ...S.sectionSub, marginBottom: 14 }}>Everyone at the table</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {authorCounts.map(({ author, count }) => (
              <CookCard key={author} author={author} count={count} active={false} onClick={() => {}} />
            ))}
          </div>
        </div>
      )}

      {/* Recently added */}
      <div style={{ marginBottom: 36 }}>
        <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 400, margin: "0 0 4px" }}>Recently added</h3>
        <p style={{ ...S.sectionSub, marginBottom: 14 }}>What's just come in</p>
        <div style={{ ...S.grid, gridTemplateColumns: isMobile ? "1fr" : S.grid.gridTemplateColumns }}>
          {recent.map(r => <RecipeCard key={r.id} recipe={r} currentUser={currentUser} onOpen={onOpenRecipe} onLike={onToggleLike} />)}
        </div>
      </div>

      {/* Most loved */}
      {popular.length > 0 && (
        <div>
          <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 400, margin: "0 0 4px" }}>Most loved</h3>
          <p style={{ ...S.sectionSub, marginBottom: 14 }}>Recipes with the most hearts</p>
          <div style={{ ...S.grid, gridTemplateColumns: isMobile ? "1fr" : S.grid.gridTemplateColumns }}>
            {popular.map(r => <RecipeCard key={r.id} recipe={r} currentUser={currentUser} onOpen={onOpenRecipe} onLike={onToggleLike} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Browse View ──────────────────────────────────────────────────────────────

function BrowseView({ recipes, allRecipes, filterCategory, setFilterCategory, filterAuthor, setFilterAuthor, allAuthors, searchQ, setSearchQ, currentUser, onOpenRecipe, onToggleLike, isMobile }) {
  const authorCounts = allAuthors.map(a => ({ author: a, count: allRecipes.filter(r => r.author === a).length }));

  return (
    <div>
      <h2 style={S.sectionTitle}>All recipes</h2>
      <p style={S.sectionSub}>{recipes.length} of {allRecipes.length} recipes</p>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input style={{ ...S.searchBox, maxWidth: "100%" }} placeholder="Search recipes, cooks, descriptions…" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
      </div>

      {/* Category filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {["All", ...CATEGORIES].map(c => (
          <button key={c} style={S.filterPill(filterCategory === c)} onClick={() => setFilterCategory(c)}>{c}</button>
        ))}
      </div>

      {/* Cook cards */}
      {authorCounts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.inkMid, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>Filter by cook</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <CookCard author="All cooks" count={allRecipes.length} active={filterAuthor === "All"} onClick={() => setFilterAuthor("All")} />
            {authorCounts.map(({ author, count }) => (
              <CookCard key={author} author={author} count={count} active={filterAuthor === author} onClick={() => setFilterAuthor(author)} />
            ))}
          </div>
        </div>
      )}

      {recipes.length === 0
        ? <div style={{ textAlign: "center", padding: "60px 0", color: T.inkLight }}>No recipes match those filters.</div>
        : <div style={{ ...S.grid, gridTemplateColumns: isMobile ? "1fr" : S.grid.gridTemplateColumns }}>
            {recipes.map(r => <RecipeCard key={r.id} recipe={r} currentUser={currentUser} onOpen={onOpenRecipe} onLike={onToggleLike} />)}
          </div>
      }
    </div>
  );
}

// ── Mine View ────────────────────────────────────────────────────────────────

function MineView({ recipes, currentUser, onOpenRecipe, onToggleLike, onAdd, isMobile }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h2 style={{ ...S.sectionTitle, margin: 0 }}>My recipes</h2>
        <button style={S.btn()} onClick={onAdd}>+ Add recipe</button>
      </div>
      <p style={S.sectionSub}>{recipes.length} {recipes.length === 1 ? "recipe" : "recipes"} from you</p>
      {recipes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontFamily: "'Georgia', serif", fontSize: 20, color: T.inkLight, marginBottom: 12 }}>Nothing here yet</div>
          <p style={{ color: T.inkLight, fontSize: 14, marginBottom: 20 }}>Add your first recipe to the table.</p>
          <button style={S.btn()} onClick={onAdd}>+ Add recipe</button>
        </div>
      ) : (
        <div style={{ ...S.grid, gridTemplateColumns: isMobile ? "1fr" : S.grid.gridTemplateColumns }}>
          {recipes.map(r => <RecipeCard key={r.id} recipe={r} currentUser={currentUser} onOpen={onOpenRecipe} onLike={onToggleLike} />)}
        </div>
      )}
    </div>
  );
}

// ── Favorites View ───────────────────────────────────────────────────────────

function FavoritesView({ recipes, currentUser, onOpenRecipe, onToggleLike, isMobile }) {
  return (
    <div>
      <h2 style={S.sectionTitle}>Saved recipes</h2>
      <p style={S.sectionSub}>{recipes.length} recipes you've hearted</p>
      {recipes.length === 0
        ? <div style={{ textAlign: "center", padding: "60px 0", color: T.inkLight }}>Heart any recipe to save it here.</div>
        : <div style={{ ...S.grid, gridTemplateColumns: isMobile ? "1fr" : S.grid.gridTemplateColumns }}>
            {recipes.map(r => <RecipeCard key={r.id} recipe={r} currentUser={currentUser} onOpen={onOpenRecipe} onLike={onToggleLike} />)}
          </div>
      }
    </div>
  );
}

// ── Recipe Modal ─────────────────────────────────────────────────────────────

function StarRating({ recipe, currentUser, onRate }) {
  const [hovered, setHovered] = useState(0);
  const myRating = recipe.ratings?.find(r => r.user_name === currentUser)?.stars ?? 0;
  const avg = avgRating(recipe.ratings);
  const count = recipe.ratings?.length ?? 0;
  const isAuthor = recipe.author === currentUser;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.inkMid, marginBottom: 6 }}>
        {isAuthor ? "Rating" : "Rate this recipe"}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              disabled={isAuthor}
              onClick={() => !isAuthor && onRate(star)}
              onMouseEnter={() => !isAuthor && setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              style={{
                background: "none", border: "none", cursor: isAuthor ? "default" : "pointer",
                fontSize: 28, padding: "0 2px", lineHeight: 1, transition: "transform 0.1s",
                transform: (hovered || myRating) >= star ? "scale(1.15)" : "scale(1)",
                color: (hovered >= star || (!hovered && myRating >= star)) ? "#F5C842" : "#DDD",
              }}
            >★</button>
          ))}
        </div>
        <div style={{ fontFamily: "'Nunito', sans-serif" }}>
          {myRating > 0 && !isAuthor && (
            <span style={{ fontSize: 13, color: T.inkMid, fontWeight: 600 }}>
              Your rating: {myRating}★
            </span>
          )}
          {count > 0 && (
            <span style={{ fontSize: 13, color: T.inkLight, marginLeft: myRating > 0 && !isAuthor ? 10 : 0 }}>
              {avg.toFixed(1)} avg · {count} {count === 1 ? "rating" : "ratings"}
            </span>
          )}
          {count === 0 && <span style={{ fontSize: 13, color: T.inkLight }}>No ratings yet</span>}
        </div>
      </div>
      {isAuthor && <div style={{ fontSize: 12, color: T.inkLight, marginTop: 4 }}>You can't rate your own recipe</div>}
    </div>
  );
}

function RecipeModal({ recipe, currentUser, onClose, onLike, onComment, newComment, setNewComment, liked, onEdit, onRate }) {
  const commentRef = useRef(null);
  const catColor = getCategoryColor(recipe.category);
  const isAuthor = recipe.author === currentUser;
  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={{ height: 7, background: catColor, borderRadius: "20px 20px 0 0" }} />
        <div style={S.modalHeader}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, color: catColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{recipe.category}</div>
              <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 22, fontWeight: 400, margin: "0 0 12px", color: T.ink }}>{recipe.title}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={recipe.author} size={26} />
                <span style={{ fontSize: 13, color: T.inkMid, fontWeight: 500 }}>{recipe.author} · {timeAgo(recipe.created_at)}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              {isAuthor && (
                <button onClick={onEdit} style={{ background: T.parchment, border: "none", borderRadius: 20, padding: "5px 14px", fontSize: 13, cursor: "pointer", color: T.inkMid, fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
                  ✏️ Edit
                </button>
              )}
              <button onClick={onClose} style={{ background: T.parchment, border: "none", borderRadius: "50%", width: 30, height: 30, fontSize: 18, cursor: "pointer", color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
          </div>
        </div>
        <div style={S.modalBody}>
          {recipe.description && (
            <p style={{ fontFamily: "'Georgia', serif", fontSize: 15, color: T.inkMid, lineHeight: 1.75, margin: "0 0 18px", fontStyle: "italic" }}>{recipe.description}</p>
          )}
          {(recipe.prep_time || recipe.cook_time) && (
            <div style={{ display: "flex", gap: 16, marginBottom: 18 }}>
              {recipe.prep_time && <div style={{ background: T.parchment, borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600 }}><span style={{ color: T.inkLight }}>Prep </span>{recipe.prep_time}</div>}
              {recipe.cook_time && <div style={{ background: T.parchment, borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600 }}><span style={{ color: T.inkLight }}>Cook </span>{recipe.cook_time}</div>}
            </div>
          )}
          <hr style={S.divider} />
          <h4 style={{ fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 400, margin: "0 0 10px", color: T.ink }}>Ingredients</h4>
          <p style={{ fontSize: 14, lineHeight: 1.75, color: T.inkMid, margin: "0 0 18px", whiteSpace: "pre-line" }}>{recipe.ingredients}</p>
          <h4 style={{ fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 400, margin: "0 0 10px", color: T.ink }}>Steps</h4>
          <p style={{ fontSize: 14, lineHeight: 1.85, color: T.inkMid, margin: "0 0 22px", whiteSpace: "pre-line" }}>{recipe.steps}</p>
          <hr style={S.divider} />
          <StarRating recipe={recipe} currentUser={currentUser} onRate={onRate} />
          <div style={{ marginBottom: 22 }}>
            <button onClick={onLike} style={{
              background: liked ? T.peachLight : T.card,
              border: `1.5px solid ${liked ? T.peach : T.border}`,
              borderRadius: 24, padding: "8px 20px", cursor: "pointer",
              fontSize: 14, color: liked ? T.peach : T.inkMid, fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
            }}>
              {liked ? "♥" : "♡"} {recipe.likes?.length ?? 0} {(recipe.likes?.length ?? 0) === 1 ? "like" : "likes"}
            </button>
          </div>
          <h4 style={{ fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 400, margin: "0 0 14px", color: T.ink }}>Comments ({recipe.comments?.length ?? 0})</h4>
          <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {(recipe.comments?.length ?? 0) === 0 && <p style={{ fontSize: 13, color: T.inkLight }}>No comments yet. Be the first!</p>}
            {[...(recipe.comments ?? [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(c => (
              <div key={c.id} style={{ display: "flex", gap: 10 }}>
                <Avatar name={c.author} size={28} />
                <div style={{ background: T.parchment, borderRadius: "4px 14px 14px 14px", padding: "10px 14px", flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3, color: T.ink }}>{c.author} <span style={{ color: T.inkLight, fontWeight: 500 }}>· {timeAgo(c.created_at)}</span></div>
                  <div style={{ fontSize: 14, color: T.inkMid, lineHeight: 1.5 }}>{c.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Avatar name={currentUser} size={28} />
            <div style={{ flex: 1 }}>
              <textarea ref={commentRef} style={{ ...S.textarea, height: 60 }}
                placeholder="Leave a comment…" value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), onComment())} />
              <button style={{ ...S.btn(), marginTop: 8, padding: "7px 18px", fontSize: 13 }} onClick={onComment}>Post</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add Recipe Modal ─────────────────────────────────────────────────────────

function AddRecipeModal({ recipe, setRecipe, onClose, onSave, isEditing = false }) {
  const set = (k, v) => setRecipe(prev => ({ ...prev, [k]: v }));
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [scanPreview, setScanPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState("");
  const cameraInputRef = useRef(null);

  function handlePhotoSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanError("");
    setScanPreview(null);

    // Resize to max 1200px on longest side before sending
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1200;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      URL.revokeObjectURL(objectUrl);
      setScanPreview(dataUrl);
    };
    img.src = objectUrl;
    // Reset input so same file can be re-selected
    e.target.value = "";
  }

  async function handleScan() {
    if (!scanPreview) return;
    setScanning(true); setScanError("");
    try {
      const base64 = scanPreview.split(",")[1];
      const res = await fetch("/api/scan-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: base64, mediaType: "image/jpeg" }),
      });
      const data = await res.json();
      if (!res.ok) { setScanError(data.error || "Couldn't read the recipe."); return; }
      setRecipe(prev => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        ingredients: data.ingredients || prev.ingredients,
        steps: data.steps || prev.steps,
        prepTime: data.prepTime || prev.prepTime,
        cookTime: data.cookTime || prev.cookTime,
        category: data.category || prev.category,
      }));
      setScanPreview(null);
    } catch {
      setScanError("Network error — please try again.");
    } finally {
      setScanning(false);
    }
  }

  async function handleImport() {
    if (!importUrl.trim()) return;
    setImporting(true); setImportError("");
    try {
      const res = await fetch(`/api/parse-recipe?url=${encodeURIComponent(importUrl.trim())}`);
      const data = await res.json();
      if (!res.ok) { setImportError(data.error || "Could not import that recipe."); return; }
      setRecipe(prev => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        ingredients: data.ingredients || prev.ingredients,
        steps: data.steps || prev.steps,
        prepTime: data.prepTime || prev.prepTime,
        cookTime: data.cookTime || prev.cookTime,
        category: data.category || prev.category,
      }));
      setImportUrl("");
    } catch {
      setImportError("Network error — couldn't reach that page.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={S.modalHeader}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 400, margin: 0, color: T.ink }}>{isEditing ? "Edit recipe" : "Add a recipe"}</h2>
            <button onClick={onClose} style={{ background: T.parchment, border: "none", borderRadius: "50%", width: 30, height: 30, fontSize: 18, cursor: "pointer", color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
        </div>

        {/* URL importer — only on new recipes */}
        {!isEditing && (
          <div style={{ margin: "0 24px", padding: "14px 16px", background: T.parchment, borderRadius: 14, marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.inkMid, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Import from a website</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                style={{ ...S.input, flex: 1, fontSize: 13 }}
                placeholder="Paste a recipe URL (AllRecipes, NYT Cooking, etc.)"
                value={importUrl}
                onChange={e => { setImportUrl(e.target.value); setImportError(""); }}
                onKeyDown={e => e.key === "Enter" && handleImport()}
              />
              <button onClick={handleImport} disabled={importing || !importUrl.trim()}
                style={{ ...S.btn("sm"), borderRadius: 24, whiteSpace: "nowrap", opacity: (importing || !importUrl.trim()) ? 0.6 : 1 }}>
                {importing ? "…" : "Import"}
              </button>
            </div>
            {importError && <div style={{ fontSize: 12, color: "#C0554A", marginTop: 6, fontWeight: 500 }}>{importError}</div>}
            {!importError && <div style={{ fontSize: 11, color: T.inkLight, marginTop: 6 }}>Fields will be pre-filled — you can edit anything before saving.</div>}
          </div>
        )}

        {/* Camera scanner — only on new recipes */}
        {!isEditing && (
          <div style={{ margin: "12px 24px 0", padding: "14px 16px", background: T.sageLight, borderRadius: 14, border: `1px solid ${T.sage}22` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.sage, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
              📷 Scan a handwritten recipe
            </div>

            {/* Hidden file input — capture="environment" opens rear camera on mobile */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handlePhotoSelected}
            />

            {!scanPreview ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  style={{ ...S.btn("outline"), borderColor: T.sage, color: T.sage, borderRadius: 24, fontSize: 13, padding: "7px 16px" }}>
                  📷 Take a photo
                </button>
                <button
                  onClick={() => { if (cameraInputRef.current) { cameraInputRef.current.removeAttribute("capture"); cameraInputRef.current.click(); cameraInputRef.current.setAttribute("capture", "environment"); } }}
                  style={{ ...S.btn("outline"), borderColor: T.sage, color: T.sage, borderRadius: 24, fontSize: 13, padding: "7px 16px" }}>
                  🖼 Upload image
                </button>
              </div>
            ) : (
              <div>
                <div style={{ position: "relative", marginBottom: 10 }}>
                  <img src={scanPreview} alt="Recipe photo" style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 10, background: "#fff", border: `1px solid ${T.border}` }} />
                  <button onClick={() => setScanPreview(null)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", fontSize: 14, color: T.inkMid, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
                <button
                  onClick={handleScan}
                  disabled={scanning}
                  style={{ ...S.btn(), background: T.sage, borderRadius: 24, fontSize: 13, padding: "8px 20px", opacity: scanning ? 0.7 : 1, width: "100%" }}>
                  {scanning ? "Reading your recipe…" : "✨ Extract recipe from photo"}
                </button>
              </div>
            )}

            {scanError && <div style={{ fontSize: 12, color: "#C0554A", marginTop: 8, fontWeight: 500 }}>{scanError}</div>}
            {!scanPreview && !scanError && (
              <div style={{ fontSize: 11, color: T.sage, marginTop: 8 }}>
                Works with index cards, notebooks, and printed recipes.
              </div>
            )}
          </div>
        )}

        <div style={S.modalBody}>
          {[
            { label: "Recipe name *", key: "title", placeholder: "e.g. Cast Iron Fried Chicken", type: "input" },
            { label: "Short description", key: "description", placeholder: "What makes this recipe special?", type: "input" },
          ].map(({ label, key, placeholder }) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={S.label}>{label}</label>
              <input style={S.input} value={recipe[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Category</label>
            <select style={S.select} value={recipe.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <label style={S.label}>Prep time</label>
              <input style={S.input} value={recipe.prepTime} onChange={e => set("prepTime", e.target.value)} placeholder="20 min" />
            </div>
            <div>
              <label style={S.label}>Cook time</label>
              <input style={S.input} value={recipe.cookTime} onChange={e => set("cookTime", e.target.value)} placeholder="45 min" />
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Ingredients</label>
            <textarea style={S.textarea} rows={4} value={recipe.ingredients} onChange={e => set("ingredients", e.target.value)} placeholder="List ingredients, one per line or comma-separated" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={S.label}>Steps</label>
            <textarea style={S.textarea} rows={6} value={recipe.steps} onChange={e => set("steps", e.target.value)} placeholder={"1. First step\n2. Second step..."} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button style={S.btn("outline")} onClick={onClose}>Cancel</button>
            <button style={{ ...S.btn(), opacity: !recipe.title.trim() ? 0.5 : 1 }} onClick={onSave} disabled={!recipe.title.trim()}>{isEditing ? "Save changes" : "Save recipe"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
