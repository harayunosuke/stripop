/* =========================================
   商品データ
   -----------------------------------------
   商品を追加するときは PRODUCTS 配列に1件ずつ追加してください。

   id        : 一意のID（英数字）
   name      : 商品名
   price     : 税込価格（数値）
   category  : カテゴリーID（下の CATEGORIES の id と一致させる）
   image     : 画像パス（例: "images/products/case-01.jpg"）
               空文字 "" の場合はボーダー柄のダミー画像が表示されます
   colors    : ダミー画像の2色 [色1, 色2]（image が空のときのみ使用・省略可）
   badge     : "NEW" / "LIMITED" など（省略可）
   soldOut   : 売り切れなら true
   date      : 登録日（新着順の並び替えに使用）
   description : 商品説明
   specs     : 仕様（ラベル: 値）
   ========================================= */

const CATEGORIES = [
  { id: "all", label: "ALL" },
  { id: "standard", label: "STANDARD" },
  { id: "slim", label: "SLIM" },
  { id: "leather", label: "LEATHER" },
  { id: "limited", label: "LIMITED" },
];

// ※ 以下はレイアウト確認用のサンプル商品です。実際の商品に置き換えてください。
const PRODUCTS = [
  {
    id: "sample-01",
    name: "BORDER CASE / YELLOW × BLACK",
    price: 3300,
    category: "standard",
    image: "",
    colors: ["#e6ff00", "#0b0b0b"],
    badge: "NEW",
    date: "2026-10-01",
    description: "STRIPOPの定番ボーダーライターケース。ここに商品説明が入ります。",
    specs: { "素材": "—", "サイズ": "—", "対応": "BIC J6 等" },
  },
  {
    id: "sample-02",
    name: "BORDER CASE / WHITE × BLACK",
    price: 3300,
    category: "standard",
    image: "",
    colors: ["#ffffff", "#0b0b0b"],
    date: "2026-09-20",
    description: "ここに商品説明が入ります。",
    specs: { "素材": "—", "サイズ": "—", "対応": "BIC J6 等" },
  },
  {
    id: "sample-03",
    name: "SLIM BORDER CASE / NEON",
    price: 2800,
    category: "slim",
    image: "",
    colors: ["#e6ff00", "#1c1c1c"],
    badge: "NEW",
    date: "2026-10-10",
    description: "ここに商品説明が入ります。",
    specs: { "素材": "—", "サイズ": "—", "対応": "BIC J25 等" },
  },
  {
    id: "sample-04",
    name: "LEATHER BORDER CASE",
    price: 5500,
    category: "leather",
    image: "",
    colors: ["#0b0b0b", "#e6ff00"],
    date: "2026-08-15",
    description: "ここに商品説明が入ります。",
    specs: { "素材": "—", "サイズ": "—", "対応": "—" },
  },
  {
    id: "sample-05",
    name: "LIMITED HAZARD CASE",
    price: 6600,
    category: "limited",
    image: "",
    colors: ["#e6ff00", "#0b0b0b"],
    badge: "LIMITED",
    date: "2026-10-15",
    description: "ここに商品説明が入ります。",
    specs: { "素材": "—", "サイズ": "—", "対応": "—" },
  },
  {
    id: "sample-06",
    name: "SLIM BORDER CASE / MONO",
    price: 2800,
    category: "slim",
    image: "",
    colors: ["#888888", "#0b0b0b"],
    soldOut: true,
    date: "2026-07-01",
    description: "ここに商品説明が入ります。",
    specs: { "素材": "—", "サイズ": "—", "対応": "BIC J25 等" },
  },
];
