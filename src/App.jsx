import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

const CATEGORIES = ["Mains", "Sides & Comfort", "Desserts & Baked Goods", "Drinks", "Other"];
const COLORS = ["#C84B2F", "#2E7D5E", "#7B5EA7", "#C07A1A", "#1A6A8A", "#8A3A4A"];

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function getColor(name) {
  let hash = 0;
  for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function Avatar({ name, size = 36 }) {
  const bg = getColor(name);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 500, fontSize: size * 0.35, flexShrink: 0,
      letterSpacing: "0.02em"
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

function getCategoryColor(cat) {
  const map = {
    "Mains": "#C84B2F", "Sides & Comfort": "#2E7D5E",
    "Desserts & Baked Goods": "#7B5EA7", "Drinks": "#1A6A8A", "Other": "#888"
  };
  return map[cat] || "#C84B2F";
}

const S = {
  app: { fontFamily: "'Georgia', serif", minHeight: "100vh", background: "#FAFAF7", color: "#1A1A14" },
  header: {
    background: "#1A1A14", color: "#F5F0E8", padding: "0 24px",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    height: 56, position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #333"
  },
  logo: { fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 400, letterSpacing: "0.04em", color: "#F5C842", margin: 0 },
  nav: { display: "flex", gap: 4 },
  navBtn: (active) => ({
    background: active ? "rgba(245,200,66,0.15)" : "transparent",
    border: "none", color: active ? "#F5C842" : "#C8C4B8", padding: "6px 14px",
    borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "sans-serif", fontWeight: active ? 500 : 400
  }),
  main: { maxWidth: 860, margin: "0 auto", padding: "32px 20px" },
  sectionTitle: { fontFamily: "'Georgia', serif", fontSize: 26, fontWeight: 400, margin: "0 0 6px", color: "#1A1A14" },
  sectionSub: { fontSize: 14, color: "#888", fontFamily: "sans-serif", margin: "0 0 24px" },
  filters: { display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", alignItems: "center" },
  filterBtn: (active) => ({
    padding: "5px 14px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontFamily: "sans-serif",
    border: active ? "1.5px solid #C84B2F" : "1px solid #D8D4CC",
    background: active ? "#FFF0ED" : "#fff", color: active ? "#C84B2F" : "#555", fontWeight: active ? 500 : 400
  }),
  searchBox: {
    border: "1px solid #D8D4CC", borderRadius: 8, padding: "8px 14px", fontSize: 14,
    fontFamily: "sans-serif", width: 220, outline: "none", background: "#fff"
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 },
  card: { background: "#fff", border: "1px solid #E8E4DC", borderRadius: 12, overflow: "hidden", cursor: "pointer" },
  cardBody: { padding: "16px" },
  cardCategory: { fontSize: 11, fontFamily: "sans-serif", color: "#C84B2F", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 },
  cardTitle: { fontFamily: "'Georgia', serif", fontSize: 17, fontWeight: 400, margin: "0 0 8px", lineHeight: 1.3 },
  cardDesc: { fontSize: 13, color: "#666", fontFamily: "sans-serif", lineHeight: 1.5, margin: "0 0 14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #F0EDE8" },
  btn: (variant = "primary") => ({
    padding: variant === "sm" ? "6px 14px" : "10px 20px",
    borderRadius: 8, cursor: "pointer", fontFamily: "sans-serif",
    fontSize: variant === "sm" ? 13 : 14, fontWeight: 500,
    background: variant === "ghost" ? "transparent" : variant === "outline" ? "#fff" : "#C84B2F",
    color: variant === "ghost" ? "#888" : variant === "outline" ? "#C84B2F" : "#fff",
    border: variant === "outline" ? "1.5px solid #C84B2F" : "none",
  }),
  modal: {
    position: "fixed", inset: 0, background: "rgba(20,18,14,0.6)", zIndex: 200,
    display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px", overflowY: "auto"
  },
  modalBox: { background: "#FAFAF7", borderRadius: 14, width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", border: "1px solid #E0DCD2" },
  modalHeader: { padding: "24px 28px 16px", borderBottom: "1px solid #EDE9E0" },
  modalBody: { padding: "24px 28px" },
  label: { fontSize: 13, fontWeight: 500, fontFamily: "sans-serif", color: "#444", display: "block", marginBottom: 6 },
  input: { width: "100%", border: "1px solid #D8D4CC", borderRadius: 8, padding: "9px 12px", fontSize: 14, fontFamily: "sans-serif", outline: "none", background: "#fff", boxSizing: "border-box" },
  textarea: { width: "100%", border: "1px solid #D8D4CC", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "sans-serif", outline: "none", background: "#fff", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" },
  select: { width: "100%", border: "1px solid #D8D4CC", borderRadius: 8, padding: "9px 12px", fontSize: 14, fontFamily: "sans-serif", outline: "none", background: "#fff", boxSizing: "border-box" },
  divider: { border: "none", borderTop: "1px solid #EDE9E0", margin: "20px 0" },
  statNum: { fontSize: 28, fontFamily: "'Georgia', serif", color: "#1A1A14" },
  statLabel: { fontSize: 12, color: "#999", fontFamily: "sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" },
};

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState(() => {
    try { return localStorage.getItem("wtf_user") || null; } catch { return null; }
  });

  const [view, setView] = useState("home");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterAuthor, setFilterAuthor] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showJoin, setShowJoin] = useState(() => {
    try { return !localStorage.getItem("wtf_user"); } catch { return true; }
  });
  const [newComment, setNewComment] = useState("");
  const [newRecipe, setNewRecipe] = useState({
    title: "", category: "Mains", description: "", ingredients: "", steps: "", prepTime: "", cookTime: ""
  });

  async function fetchRecipes() {
    const { data } = await supabase
      .from("recipes")
      .select("*, likes(user_name), comments(id, author, text, created_at)")
      .order("created_at", { ascending: false });
    if (data) setRecipes(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchRecipes();
    const channel = supabase
      .channel("wtf-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "recipes" }, fetchRecipes)
      .on("postgres_changes", { event: "*", schema: "public", table: "likes" }, fetchRecipes)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, fetchRecipes)
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
      title: newRecipe.title.trim(),
      category: newRecipe.category,
      description: newRecipe.description,
      ingredients: newRecipe.ingredients,
      steps: newRecipe.steps,
      prep_time: newRecipe.prepTime,
      cook_time: newRecipe.cookTime,
      author: currentUser,
    });
    setNewRecipe({ title: "", category: "Mains", description: "", ingredients: "", steps: "", prepTime: "", cookTime: "" });
    setShowAddRecipe(false);
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

  async function addComment(recipeId) {
    if (!newComment.trim() || !currentUser) return;
    await supabase.from("comments").insert({ recipe_id: recipeId, author: currentUser, text: newComment.trim() });
    setNewComment("");
  }

  const allAuthors = ["All", ...Array.from(new Set(recipes.map(r => r.author)))];

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
      <div style={{ fontFamily: "sans-serif", color: "#999", fontSize: 14 }}>Loading recipes…</div>
    </div>
  );

  return (
    <div style={S.app}>
      <header style={S.header}>
        <h1 style={S.logo}>What The Fork</h1>
        <nav style={S.nav}>
          {["home", "browse", "mine", "favorites"].map(v => (
            <button key={v} style={S.navBtn(view === v)} onClick={() => setView(v)}>
              {v === "home" ? "Home" : v === "browse" ? "All recipes" : v === "mine" ? "My recipes" : "Saved"}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ ...S.btn(), padding: "6px 16px", fontSize: 13 }} onClick={() => setShowAddRecipe(true)}>+ Add recipe</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar name={currentUser} size={30} />
            <span style={{ fontSize: 13, fontFamily: "sans-serif", color: "#C8C4B8" }}>{currentUser}</span>
            <button onClick={logout} title="Sign out" style={{ background: "none", border: "none", color: "#555", fontSize: 16, cursor: "pointer", padding: "0 2px", lineHeight: 1 }}>⏏</button>
          </div>
        </div>
      </header>

      <main style={S.main}>
        {view === "home" && <HomeView recipes={recipes} currentUser={currentUser} onOpenRecipe={setSelectedRecipe} onToggleLike={toggleLike} />}
        {view === "browse" && (
          <BrowseView
            recipes={filtered} allRecipes={recipes}
            filterCategory={filterCategory} setFilterCategory={setFilterCategory}
            filterAuthor={filterAuthor} setFilterAuthor={setFilterAuthor}
            allAuthors={allAuthors} searchQ={searchQ} setSearchQ={setSearchQ}
            currentUser={currentUser} onOpenRecipe={setSelectedRecipe} onToggleLike={toggleLike}
          />
        )}
        {view === "mine" && <MineView recipes={myRecipes} currentUser={currentUser} onOpenRecipe={setSelectedRecipe} onToggleLike={toggleLike} onAdd={() => setShowAddRecipe(true)} />}
        {view === "favorites" && <FavoritesView recipes={myFavorites} currentUser={currentUser} onOpenRecipe={setSelectedRecipe} onToggleLike={toggleLike} />}
      </main>

      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe} currentUser={currentUser}
          onClose={() => setSelectedRecipe(null)}
          onLike={() => toggleLike(selectedRecipe.id)}
          onComment={() => addComment(selectedRecipe.id)}
          newComment={newComment} setNewComment={setNewComment}
          liked={selectedRecipe.likes?.some(l => l.user_name === currentUser)}
        />
      )}

      {showAddRecipe && (
        <AddRecipeModal recipe={newRecipe} setRecipe={setNewRecipe} onClose={() => setShowAddRecipe(false)} onSave={addRecipe} />
      )}
    </div>
  );
}

function JoinScreen({ onJoin }) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState("name"); // "name" | "pin-new" | "pin-return"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleNameNext() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    const { data } = await supabase.from("users").select("name").eq("name", trimmed).maybeSingle();
    setLoading(false);
    setStep(data ? "pin-return" : "pin-new");
  }

  async function handlePinSubmit() {
    const trimmed = name.trim();
    if (pin.length !== 4) { setError("PIN must be 4 digits."); return; }
    setLoading(true);
    setError("");

    if (step === "pin-new") {
      await supabase.from("users").insert({ name: trimmed, pin });
      onJoin(trimmed);
    } else {
      const { data } = await supabase.from("users").select("pin").eq("name", trimmed).maybeSingle();
      if (data?.pin === pin) {
        onJoin(trimmed);
      } else {
        setError("Wrong PIN. Try again.");
        setPin("");
      }
    }
    setLoading(false);
  }

  const inputStyle = { width: "100%", background: "#1A1A14", border: "1px solid #444", borderRadius: 8, padding: "10px 14px", fontSize: 15, color: "#F5F0E8", fontFamily: "sans-serif", outline: "none", boxSizing: "border-box", marginBottom: 14 };

  return (
    <div style={{ minHeight: "100vh", background: "#1A1A14", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 32 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, fontFamily: "'Georgia', serif", color: "#F5C842", marginBottom: 8 }}>What The Fork</div>
        <div style={{ fontSize: 16, color: "#888", fontFamily: "sans-serif" }}>A shared cookbook for friends</div>
      </div>
      <div style={{ background: "#242420", borderRadius: 16, padding: "32px", width: 340, border: "1px solid #333" }}>

        {step === "name" && (
          <>
            <p style={{ color: "#C8C4B8", fontFamily: "sans-serif", fontSize: 14, marginTop: 0, marginBottom: 20, lineHeight: 1.6 }}>
              Enter your name to join. You'll set a 4-digit PIN so you can sign in as yourself from any device.
            </p>
            <input style={inputStyle} placeholder="Your name" value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleNameNext()}
              autoFocus />
            <button onClick={handleNameNext} disabled={loading || !name.trim()}
              style={{ width: "100%", background: "#C84B2F", border: "none", borderRadius: 8, padding: "11px", fontSize: 15, color: "#fff", fontFamily: "sans-serif", fontWeight: 500, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Checking…" : "Continue →"}
            </button>
          </>
        )}

        {(step === "pin-new" || step === "pin-return") && (
          <>
            {step === "pin-new" && (
              <p style={{ color: "#C8C4B8", fontFamily: "sans-serif", fontSize: 14, marginTop: 0, marginBottom: 8, lineHeight: 1.6 }}>
                Welcome, <strong style={{ color: "#F5F0E8" }}>{name}</strong>! Choose a 4-digit PIN — you'll use this to sign in from any device.
              </p>
            )}
            {step === "pin-return" && (
              <p style={{ color: "#C8C4B8", fontFamily: "sans-serif", fontSize: 14, marginTop: 0, marginBottom: 8, lineHeight: 1.6 }}>
                Welcome back, <strong style={{ color: "#F5F0E8" }}>{name}</strong>! Enter your PIN to continue.
              </p>
            )}
            <input style={{ ...inputStyle, letterSpacing: "0.3em", textAlign: "center", fontSize: 22 }}
              placeholder="••••" maxLength={4} value={pin} type="password" inputMode="numeric"
              onChange={e => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handlePinSubmit()}
              autoFocus />
            {error && <div style={{ color: "#E87070", fontFamily: "sans-serif", fontSize: 13, marginBottom: 12, marginTop: -8 }}>{error}</div>}
            <button onClick={handlePinSubmit} disabled={loading || pin.length !== 4}
              style={{ width: "100%", background: "#C84B2F", border: "none", borderRadius: 8, padding: "11px", fontSize: 15, color: "#fff", fontFamily: "sans-serif", fontWeight: 500, cursor: "pointer", opacity: (loading || pin.length !== 4) ? 0.7 : 1 }}>
              {loading ? "Checking…" : step === "pin-new" ? "Set PIN & join" : "Sign in"}
            </button>
            <button onClick={() => { setStep("name"); setPin(""); setError(""); }}
              style={{ width: "100%", background: "transparent", border: "none", color: "#666", fontFamily: "sans-serif", fontSize: 13, marginTop: 10, cursor: "pointer" }}>
              ← Use a different name
            </button>
          </>
        )}

      </div>
    </div>
  );
}

function RecipeCard({ recipe, currentUser, onOpen, onLike }) {
  const liked = recipe.likes?.some(l => l.user_name === currentUser);
  return (
    <div style={S.card} onClick={() => onOpen(recipe)}>
      <div style={{ height: 6, background: getCategoryColor(recipe.category) }} />
      <div style={S.cardBody}>
        <div style={S.cardCategory}>{recipe.category}</div>
        <h3 style={S.cardTitle}>{recipe.title}</h3>
        <p style={S.cardDesc}>{recipe.description}</p>
        <div style={S.cardFooter}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar name={recipe.author} size={24} />
            <span style={{ fontSize: 12, fontFamily: "sans-serif", color: "#888" }}>{recipe.author}</span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={e => { e.stopPropagation(); onLike(recipe.id); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: liked ? "#C84B2F" : "#AAA", fontFamily: "sans-serif", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
              {liked ? "♥" : "♡"} {recipe.likes?.length ?? 0}
            </button>
            <span style={{ fontSize: 13, color: "#AAA", fontFamily: "sans-serif" }}>💬 {recipe.comments?.length ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeView({ recipes, currentUser, onOpenRecipe, onToggleLike }) {
  const recent = [...recipes].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
  const popular = [...recipes].sort((a, b) => (b.likes?.length ?? 0) - (a.likes?.length ?? 0)).slice(0, 3);
  const authors = Array.from(new Set(recipes.map(r => r.author)));
  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ ...S.sectionTitle, marginBottom: 4 }}>Welcome back, {currentUser} 👋</h2>
        <p style={S.sectionSub}>{recipes.length} recipes from {authors.length} {authors.length === 1 ? "cook" : "cooks"} at the table</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 20, maxWidth: 420 }}>
          {[["Recipes", recipes.length], ["Cooks", authors.length], ["Your saves", recipes.filter(r => r.likes?.some(l => l.user_name === currentUser)).length]].map(([l, n]) => (
            <div key={l} style={{ background: "#fff", border: "1px solid #E8E4DC", borderRadius: 10, padding: "14px 12px", textAlign: "center" }}>
              <div style={S.statNum}>{n}</div>
              <div style={S.statLabel}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 40 }}>
        <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 400, marginBottom: 4 }}>Recently added</h3>
        <p style={{ ...S.sectionSub, marginBottom: 18 }}>What's just come in</p>
        <div style={S.grid}>{recent.map(r => <RecipeCard key={r.id} recipe={r} currentUser={currentUser} onOpen={onOpenRecipe} onLike={onToggleLike} />)}</div>
      </div>
      {popular.length > 0 && (
        <div>
          <h3 style={{ fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 400, marginBottom: 4 }}>Most loved</h3>
          <p style={{ ...S.sectionSub, marginBottom: 18 }}>Recipes with the most hearts</p>
          <div style={S.grid}>{popular.map(r => <RecipeCard key={r.id} recipe={r} currentUser={currentUser} onOpen={onOpenRecipe} onLike={onToggleLike} />)}</div>
        </div>
      )}
    </div>
  );
}

function BrowseView({ recipes, allRecipes, filterCategory, setFilterCategory, filterAuthor, setFilterAuthor, allAuthors, searchQ, setSearchQ, currentUser, onOpenRecipe, onToggleLike }) {
  return (
    <div>
      <h2 style={S.sectionTitle}>All recipes</h2>
      <p style={S.sectionSub}>{recipes.length} of {allRecipes.length} recipes</p>
      <div style={S.filters}>
        <input style={S.searchBox} placeholder="Search recipes..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
        {["All", ...CATEGORIES].map(c => (
          <button key={c} style={S.filterBtn(filterCategory === c)} onClick={() => setFilterCategory(c)}>{c}</button>
        ))}
      </div>
      <div style={{ ...S.filters, marginTop: -10 }}>
        {allAuthors.map(a => (
          <button key={a} style={S.filterBtn(filterAuthor === a)} onClick={() => setFilterAuthor(a)}>{a === "All" ? "All cooks" : a}</button>
        ))}
      </div>
      {recipes.length === 0
        ? <div style={{ textAlign: "center", padding: "60px 0", color: "#999", fontFamily: "sans-serif" }}>No recipes match those filters.</div>
        : <div style={S.grid}>{recipes.map(r => <RecipeCard key={r.id} recipe={r} currentUser={currentUser} onOpen={onOpenRecipe} onLike={onToggleLike} />)}</div>
      }
    </div>
  );
}

function MineView({ recipes, currentUser, onOpenRecipe, onToggleLike, onAdd }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <h2 style={{ ...S.sectionTitle, margin: 0 }}>My recipes</h2>
        <button style={S.btn()} onClick={onAdd}>+ Add recipe</button>
      </div>
      <p style={S.sectionSub}>{recipes.length} {recipes.length === 1 ? "recipe" : "recipes"} from you</p>
      {recipes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontFamily: "'Georgia', serif", fontSize: 20, color: "#999", marginBottom: 12 }}>Nothing here yet</div>
          <p style={{ color: "#AAA", fontFamily: "sans-serif", fontSize: 14, marginBottom: 20 }}>Add your first recipe to the table.</p>
          <button style={S.btn()} onClick={onAdd}>+ Add recipe</button>
        </div>
      ) : (
        <div style={S.grid}>{recipes.map(r => <RecipeCard key={r.id} recipe={r} currentUser={currentUser} onOpen={onOpenRecipe} onLike={onToggleLike} />)}</div>
      )}
    </div>
  );
}

function FavoritesView({ recipes, currentUser, onOpenRecipe, onToggleLike }) {
  return (
    <div>
      <h2 style={S.sectionTitle}>Saved recipes</h2>
      <p style={S.sectionSub}>{recipes.length} recipes you've hearted</p>
      {recipes.length === 0
        ? <div style={{ textAlign: "center", padding: "60px 0", color: "#AAA", fontFamily: "sans-serif" }}>Heart any recipe to save it here.</div>
        : <div style={S.grid}>{recipes.map(r => <RecipeCard key={r.id} recipe={r} currentUser={currentUser} onOpen={onOpenRecipe} onLike={onToggleLike} />)}</div>
      }
    </div>
  );
}

function RecipeModal({ recipe, currentUser, onClose, onLike, onComment, newComment, setNewComment, liked }) {
  const commentRef = useRef(null);
  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={{ height: 6, background: getCategoryColor(recipe.category), borderRadius: "14px 14px 0 0" }} />
        <div style={S.modalHeader}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ ...S.cardCategory, marginBottom: 8 }}>{recipe.category}</div>
              <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 24, fontWeight: 400, margin: "0 0 12px" }}>{recipe.title}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={recipe.author} size={28} />
                <span style={{ fontFamily: "sans-serif", fontSize: 13, color: "#666" }}>{recipe.author} · {timeAgo(recipe.created_at)}</span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#999", padding: 0 }}>×</button>
          </div>
        </div>
        <div style={S.modalBody}>
          {recipe.description && (
            <p style={{ fontFamily: "'Georgia', serif", fontSize: 16, color: "#555", lineHeight: 1.7, margin: "0 0 20px", fontStyle: "italic" }}>{recipe.description}</p>
          )}
          {(recipe.prep_time || recipe.cook_time) && (
            <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
              {recipe.prep_time && <div style={{ fontFamily: "sans-serif", fontSize: 13 }}><span style={{ color: "#999" }}>Prep</span> <strong>{recipe.prep_time}</strong></div>}
              {recipe.cook_time && <div style={{ fontFamily: "sans-serif", fontSize: 13 }}><span style={{ color: "#999" }}>Cook</span> <strong>{recipe.cook_time}</strong></div>}
            </div>
          )}
          <hr style={S.divider} />
          <h4 style={{ fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 400, margin: "0 0 10px" }}>Ingredients</h4>
          <p style={{ fontFamily: "sans-serif", fontSize: 14, lineHeight: 1.7, color: "#444", margin: "0 0 20px", whiteSpace: "pre-line" }}>{recipe.ingredients}</p>
          <h4 style={{ fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 400, margin: "0 0 10px" }}>Steps</h4>
          <p style={{ fontFamily: "sans-serif", fontSize: 14, lineHeight: 1.8, color: "#444", margin: "0 0 24px", whiteSpace: "pre-line" }}>{recipe.steps}</p>
          <hr style={S.divider} />
          <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
            <button onClick={onLike} style={{ background: "none", border: `1.5px solid ${liked ? "#C84B2F" : "#D8D4CC"}`, borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontFamily: "sans-serif", fontSize: 14, color: liked ? "#C84B2F" : "#666", fontWeight: liked ? 500 : 400 }}>
              {liked ? "♥" : "♡"} {recipe.likes?.length ?? 0} {(recipe.likes?.length ?? 0) === 1 ? "like" : "likes"}
            </button>
          </div>
          <h4 style={{ fontFamily: "'Georgia', serif", fontSize: 16, fontWeight: 400, margin: "0 0 16px" }}>Comments ({recipe.comments?.length ?? 0})</h4>
          <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            {(recipe.comments?.length ?? 0) === 0 && <p style={{ fontFamily: "sans-serif", fontSize: 13, color: "#AAA" }}>No comments yet. Be the first!</p>}
            {[...(recipe.comments ?? [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(c => (
              <div key={c.id} style={{ display: "flex", gap: 10 }}>
                <Avatar name={c.author} size={28} />
                <div style={{ background: "#F5F0E8", borderRadius: "0 10px 10px 10px", padding: "10px 14px", flex: 1 }}>
                  <div style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{c.author} <span style={{ color: "#AAA", fontWeight: 400 }}>· {timeAgo(c.created_at)}</span></div>
                  <div style={{ fontFamily: "sans-serif", fontSize: 14, color: "#333", lineHeight: 1.5 }}>{c.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Avatar name={currentUser} size={28} />
            <div style={{ flex: 1 }}>
              <textarea ref={commentRef} style={{ ...S.textarea, height: 60 }} placeholder="Leave a comment..." value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), onComment())} />
              <button style={{ ...S.btn(), marginTop: 8, padding: "7px 16px", fontSize: 13 }} onClick={onComment}>Post</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddRecipeModal({ recipe, setRecipe, onClose, onSave }) {
  const set = (k, v) => setRecipe(prev => ({ ...prev, [k]: v }));
  return (
    <div style={S.modal} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.modalBox}>
        <div style={S.modalHeader}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "'Georgia', serif", fontSize: 20, fontWeight: 400, margin: 0 }}>Add a recipe</h2>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#999" }}>×</button>
          </div>
        </div>
        <div style={S.modalBody}>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Recipe name *</label>
            <input style={S.input} value={recipe.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Cast Iron Fried Chicken" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Category</label>
            <select style={S.select} value={recipe.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Short description</label>
            <input style={S.input} value={recipe.description} onChange={e => set("description", e.target.value)} placeholder="What makes this recipe special?" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label style={S.label}>Prep time</label>
              <input style={S.input} value={recipe.prepTime} onChange={e => set("prepTime", e.target.value)} placeholder="20 min" />
            </div>
            <div>
              <label style={S.label}>Cook time</label>
              <input style={S.input} value={recipe.cookTime} onChange={e => set("cookTime", e.target.value)} placeholder="45 min" />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Ingredients</label>
            <textarea style={S.textarea} rows={4} value={recipe.ingredients} onChange={e => set("ingredients", e.target.value)} placeholder="List ingredients, one per line or comma-separated" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={S.label}>Steps</label>
            <textarea style={S.textarea} rows={6} value={recipe.steps} onChange={e => set("steps", e.target.value)} placeholder={"1. First step\n2. Second step..."} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button style={S.btn("outline")} onClick={onClose}>Cancel</button>
            <button style={S.btn()} onClick={onSave} disabled={!recipe.title.trim()}>Save recipe</button>
          </div>
        </div>
      </div>
    </div>
  );
}
