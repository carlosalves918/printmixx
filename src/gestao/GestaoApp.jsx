import { supabaseGestao, gestaoSupabaseConfigured } from "./supabaseGestaoClient";
import PrecosTab from "./PrecosTab";
import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutGrid, Package, ShoppingBag, Receipt, TrendingUp, AlertTriangle,
  Search, Plus, ChevronRight, ArrowUpRight, ArrowDownRight,
  CheckCircle2, Clock, XCircle, Store, Trash2, Calculator, PackagePlus,
  FileText, ExternalLink, Square, Zap, Printer, Pencil, Smartphone, PartyPopper,
  Award, ShoppingCart, DollarSign, Instagram, MessageCircle, MapPin, Users, Boxes, Layers, Truck, Headphones, Gift,
  Tags, LogOut
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Cell
} from "recharts";
import "./gestao-tailwind.css";
import siteLogo from "../assets/logo.png";

// ---------- Design tokens (PRINT MIXX) ----------
const C = {
  bg: "#12081F",
  panel: "#1C1030",
  panelAlt: "#241640",
  border: "rgba(168,85,247,0.22)",
  borderStrong: "rgba(240,25,138,0.35)",
  text: "#F3EEFC",
  textMuted: "#9C8FC0",
  orange: "#FF7A1A",
  purple: "#9333EA",
  pink: "#F0198A",
  cyan: "#1E88E5",
  gold: "#FFC300",
  green: "#22C55E",
  greenBg: "rgba(34,197,94,0.14)",
  goldBg: "rgba(255,195,0,0.14)",
  redBg: "rgba(255,77,109,0.14)",
  red: "#FF4D6D",
};
const GRADIENT = `linear-gradient(135deg, ${C.orange} 0%, ${C.pink} 55%, ${C.purple} 100%)`;

// ---------- Cadastros dinâmicos (Categorias e Canais de venda) ----------
// Ícones disponíveis para o usuário escolher ao cadastrar uma categoria nova.
const ICON_LIBRARY = {
  Printer, Pencil, Smartphone, PartyPopper, Package, PackagePlus,
  Gift, Boxes, Layers, Truck, Headphones, ShoppingBag, ShoppingCart,
  Tags, Zap, Store, Square,
};
const ICON_LIBRARY_KEYS = Object.keys(ICON_LIBRARY);

// Paleta usada pra sugerir uma cor automaticamente quando o usuário cadastra
// uma categoria/canal novo (ele pode trocar depois).
const AUTO_COLOR_PALETTE = ["#9333EA", "#FF7A1A", "#17B6E8", "#F0198A", "#FFC300", "#22C55E", "#1E88E5", "#FF4D6D"];
function nextAutoColor(existingCount) {
  return AUTO_COLOR_PALETTE[existingCount % AUTO_COLOR_PALETTE.length];
}

// Busca uma categoria pelo id numa lista dinâmica; se não achar (ex.: categoria
// excluída depois que o produto foi cadastrado), devolve um fallback neutro
// pra não quebrar a tela.
function findCategoria(categorias, id) {
  return (
    (categorias || []).find(c => c.id === id) ||
    { id: id || "—", label: id || "Sem categoria", icon: "Tags", color: "#6B7280" }
  );
}
// Mesma ideia, mas pra canal de venda.
function findCanal(canais, id) {
  return (
    (canais || []).find(c => c.id === id) ||
    { id: id || "—", label: id || "Canal removido", color: "#6B7280" }
  );
}

// ---------- Mock data ----------
const DEFAULT_CATEGORIAS = [
  { id: "Gráfica", label: "Serviços Gráficos", icon: "Printer", color: "#9333EA" },
  { id: "Papelaria", label: "Papelaria", icon: "Pencil", color: "#FF7A1A" },
  { id: "Acessórios", label: "Acessórios p/ Celular", icon: "Smartphone", color: "#17B6E8" },
  { id: "Festa", label: "Sacolinhas de Festa", icon: "PartyPopper", color: "#F0198A" },
];

const DEFAULT_PRODUTOS_ESTOQUE = [
  { id: "PF-001", nome: "Topo de Bolo Personalizado", categoria: "Festa", estoque: 8, minimo: 15, custo: 2.9, preco: 12.9, unidade: "un" },
  { id: "PF-002", nome: "Kit Festa Completo (topo+tags+painel mini)", categoria: "Festa", estoque: 5, minimo: 10, custo: 24.5, preco: 69.9, unidade: "kit" },
  { id: "PF-003", nome: "Lembrancinha Personalizada (saquinho)", categoria: "Festa", estoque: 140, minimo: 50, custo: 1.4, preco: 4.9, unidade: "un" },
  { id: "PF-004", nome: "Painel de Festa 1,5x1,5m", categoria: "Festa", estoque: 3, minimo: 6, custo: 38.0, preco: 129.9, unidade: "un" },
  { id: "GR-001", nome: "Cartão de Visita (250un)", categoria: "Gráfica", estoque: 6, minimo: 10, custo: 28.0, preco: 79.9, unidade: "lote" },
  { id: "GR-002", nome: "Banner Lona 90x60cm", categoria: "Gráfica", estoque: 3, minimo: 8, custo: 22.0, preco: 59.9, unidade: "un" },
  { id: "GR-003", nome: "Adesivo Vinil Recorte (folha A4)", categoria: "Gráfica", estoque: 42, minimo: 20, custo: 3.1, preco: 9.9, unidade: "folha" },
  { id: "PP-001", nome: "Caderno Personalizado A5", categoria: "Papelaria", estoque: 8, minimo: 15, custo: 12.4, preco: 34.9, unidade: "un" },
  { id: "PP-002", nome: "Kit Caneta + Bloco de Notas", categoria: "Papelaria", estoque: 65, minimo: 25, custo: 4.8, preco: 14.9, unidade: "kit" },
  { id: "PP-003", nome: "Planner Personalizado 2026", categoria: "Papelaria", estoque: 14, minimo: 15, custo: 18.5, preco: 49.9, unidade: "un" },
  { id: "AC-001", nome: "Carregador Turbo USB-C 20W", categoria: "Acessórios", estoque: 22, minimo: 15, custo: 19.9, preco: 39.9, unidade: "un" },
  { id: "AC-002", nome: "Suporte Veicular Magnético", categoria: "Acessórios", estoque: 9, minimo: 12, custo: 14.5, preco: 32.9, unidade: "un" },
  { id: "AC-003", nome: "Cabo USB-C Reforçado 1m", categoria: "Acessórios", estoque: 30, minimo: 20, custo: 6.2, preco: 16.9, unidade: "un" },
];

const DEFAULT_CANAIS = [
  { id: "Shopee", label: "Shopee", color: C.orange },
  { id: "TikTok Shop", label: "TikTok Shop", color: C.cyan },
  { id: "Loja própria", label: "Loja própria", color: C.purple },
];
const CANAL_BAR_COLORS = [C.orange, C.cyan, C.purple];

const PEDIDOS = [
  { id: "#10482", cliente: "Marina Ferreira", canal: "Shopee", itens: "Kit Festa Completo x1", total: 69.9, status: "aguardando_nf", data: "20/07 09:14" },
  { id: "#10481", cliente: "loja.decora_sp", canal: "TikTok Shop", itens: "Topo de Bolo x3", total: 38.7, status: "emitida", data: "20/07 08:52" },
  { id: "#10480", cliente: "Carlos Nogueira", canal: "Loja própria", itens: "Painel de Festa 1,5x1,5m", total: 129.9, status: "emitida", data: "19/07 18:20" },
  { id: "#10479", cliente: "ana.papelaria_rj", canal: "TikTok Shop", itens: "Lembrancinha x20", total: 98.0, status: "erro", data: "19/07 17:03" },
  { id: "#10478", cliente: "Rafael Souza", canal: "Shopee", itens: "Copo Personalizado x10", total: 129.0, status: "aguardando_nf", data: "19/07 15:41" },
  { id: "#10477", cliente: "Beatriz Lima", canal: "Shopee", itens: "Convite Digital x30", total: 90.0, status: "emitida", data: "19/07 11:09" },
];

const VENDAS_7D = [
  { dia: "14/07", total: 640 }, { dia: "15/07", total: 812 }, { dia: "16/07", total: 590 },
  { dia: "17/07", total: 940 }, { dia: "18/07", total: 1120 }, { dia: "19/07", total: 780 },
  { dia: "20/07", total: 430 },
];

const CANAL_SPLIT = [
  { canal: "Shopee", valor: 3120 },
  { canal: "TikTok Shop", valor: 1890 },
  { canal: "Loja própria", valor: 980 },
];

// Referência de mercado (Brasil, jul/2026) — ajuste pelos preços do seu fornecedor
const DEFAULT_INSUMOS = [
  { id: "ins-01", nome: "Papel fotográfico adesivo A4 (topper/tags)", unidade: "folha", custo: 0.35 },
  { id: "ins-02", nome: "Cartolina / papel cartão A4 (tags)", unidade: "folha", custo: 0.45 },
  { id: "ins-03", nome: "Folha EVA 40x60cm 2mm", unidade: "folha", custo: 4.5 },
  { id: "ins-04", nome: "Placa MDF 3mm (30x30cm aprox.)", unidade: "placa", custo: 11.0 },
  { id: "ins-05", nome: "Fita de cetim (10-15mm)", unidade: "metro", custo: 0.5 },
  { id: "ins-06", nome: "Saquinho celofane/organza", unidade: "un", custo: 0.4 },
  { id: "ins-07", nome: "Impressão colorida (jato/laser)", unidade: "impressão", custo: 0.4 },
  { id: "ins-08", nome: "Cola quente (bastão, por peça)", unidade: "un", custo: 0.2 },
  { id: "ins-09", nome: "Vela lisa (base p/ personalizar)", unidade: "un", custo: 1.5 },
  { id: "ins-10", nome: "Copo plástico/acrílico liso 350ml", unidade: "un", custo: 3.2 },
  { id: "ins-11", nome: "Mão de obra", unidade: "hora", custo: 28.0 },
];

// Produtos custeados (aba "Composição de Custo" / "Precificação" da planilha)
const DEFAULT_PRODUTOS_CUSTEIO = [
  { id: "pc-01", nome: "Topo de Bolo Personalizado" },
  { id: "pc-02", nome: "Kit Festa Completo (topo+tags+painel mini)" },
  { id: "pc-03", nome: "Lembrancinha Personalizada (saquinho)" },
  { id: "pc-04", nome: "Painel de Festa 1,5x1,5m" },
  { id: "pc-05", nome: "Convite Digital Personalizado" },
  { id: "pc-06", nome: "Tag Agradecimento (cartão)" },
  { id: "pc-07", nome: "Vela Personalizada de Aniversário" },
  { id: "pc-08", nome: "Copo Personalizado 350ml" },
];

const DEFAULT_COMPOSICAO = [
  { id: "ci-01", produtoId: "pc-01", insumoId: "ins-01", qtd: 1 },
  { id: "ci-02", produtoId: "pc-01", insumoId: "ins-07", qtd: 1 },
  { id: "ci-03", produtoId: "pc-01", insumoId: "ins-08", qtd: 1 },
  { id: "ci-04", produtoId: "pc-01", insumoId: "ins-11", qtd: 0.1 },

  { id: "ci-05", produtoId: "pc-02", insumoId: "ins-01", qtd: 2 },
  { id: "ci-06", produtoId: "pc-02", insumoId: "ins-02", qtd: 5 },
  { id: "ci-07", produtoId: "pc-02", insumoId: "ins-03", qtd: 2 },
  { id: "ci-08", produtoId: "pc-02", insumoId: "ins-07", qtd: 3 },
  { id: "ci-09", produtoId: "pc-02", insumoId: "ins-05", qtd: 2 },
  { id: "ci-10", produtoId: "pc-02", insumoId: "ins-08", qtd: 3 },
  { id: "ci-11", produtoId: "pc-02", insumoId: "ins-11", qtd: 0.6 },

  { id: "ci-12", produtoId: "pc-03", insumoId: "ins-06", qtd: 1 },
  { id: "ci-13", produtoId: "pc-03", insumoId: "ins-02", qtd: 1 },
  { id: "ci-14", produtoId: "pc-03", insumoId: "ins-05", qtd: 0.3 },
  { id: "ci-15", produtoId: "pc-03", insumoId: "ins-11", qtd: 0.05 },

  { id: "ci-16", produtoId: "pc-04", insumoId: "ins-03", qtd: 6 },
  { id: "ci-17", produtoId: "pc-04", insumoId: "ins-07", qtd: 4 },
  { id: "ci-18", produtoId: "pc-04", insumoId: "ins-05", qtd: 3 },
  { id: "ci-19", produtoId: "pc-04", insumoId: "ins-11", qtd: 1.5 },

  { id: "ci-20", produtoId: "pc-05", insumoId: "ins-11", qtd: 0.03 },

  { id: "ci-21", produtoId: "pc-06", insumoId: "ins-02", qtd: 1 },
  { id: "ci-22", produtoId: "pc-06", insumoId: "ins-07", qtd: 0.25 },
  { id: "ci-23", produtoId: "pc-06", insumoId: "ins-11", qtd: 0.02 },

  { id: "ci-24", produtoId: "pc-07", insumoId: "ins-09", qtd: 1 },
  { id: "ci-25", produtoId: "pc-07", insumoId: "ins-01", qtd: 1 },
  { id: "ci-26", produtoId: "pc-07", insumoId: "ins-11", qtd: 0.1 },

  { id: "ci-27", produtoId: "pc-08", insumoId: "ins-10", qtd: 1 },
  { id: "ci-28", produtoId: "pc-08", insumoId: "ins-01", qtd: 0.5 },
  { id: "ci-29", produtoId: "pc-08", insumoId: "ins-11", qtd: 0.05 },
];

const DEFAULT_PRECIFICACAO = {
  "pc-01": { margem: 0.65, precoPraticado: 12.9 },
  "pc-02": { margem: 0.65, precoPraticado: 69.9 },
  "pc-03": { margem: 0.65, precoPraticado: 4.9 },
  "pc-04": { margem: 0.65, precoPraticado: 129.9 },
  "pc-05": { margem: 0.8, precoPraticado: 14.9 },
  "pc-06": { margem: 0.65, precoPraticado: 1.5 },
  "pc-07": { margem: 0.65, precoPraticado: 14.9 },
  "pc-08": { margem: 0.65, precoPraticado: 12.9 },
};



// ---------- Brand atoms ----------
function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
    `}</style>
  );
}

function BrandMark({ size = 28 }) {
  return (
    <img
      src={siteLogo}
      alt="PRINT MIXX"
      style={{ width: size, height: size, objectFit: "contain", borderRadius: 6, display: "block" }}
    />
  );
}

function CornerStripes({ side = "right" }) {
  const stripes = [
    { color: C.gold, w: 10 },
    { color: C.pink, w: 8 },
    { color: C.purple, w: 6 },
  ];
  return (
    <div
      className="absolute top-0 pointer-events-none overflow-hidden"
      style={{ [side]: 0, width: 140, height: 64 }}
    >
      {stripes.map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            [side]: -20 + i * 26,
            top: -30,
            width: s.w,
            height: 160,
            background: s.color,
            transform: "rotate(28deg)",
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

function GlowCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background: C.panel,
        border: `1px solid ${C.border}`,
        boxShadow: "0 12px 32px -18px rgba(147,51,234,0.45)",
      }}
    >
      {children}
    </div>
  );
}

function Ribbon({ children, tone = "gold" }) {
  const tones = {
    gold: { bg: C.gold, fg: "#241640" },
    pink: { bg: C.pink, fg: "#fff" },
    cyan: { bg: C.cyan, fg: "#0B1620" },
  };
  const t = tones[tone];
  return (
    <span
      className="inline-flex items-center px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider"
      style={{ background: t.bg, color: t.fg, transform: "skewX(-8deg)", borderRadius: 3 }}
    >
      <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>{children}</span>
    </span>
  );
}

function StatusPill({ status }) {
  const map = {
    emitida: { label: "NF emitida", icon: CheckCircle2, fg: C.green, bg: C.greenBg },
    aguardando_nf: { label: "Aguardando NF", icon: Clock, fg: C.gold, bg: C.goldBg },
    erro: { label: "Erro emissão", icon: XCircle, fg: C.red, bg: C.redBg },
  };
  const s = map[status];
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold tracking-wide"
      style={{ color: s.fg, background: s.bg }}
    >
      <Icon size={12} strokeWidth={2.5} />
      {s.label}
    </span>
  );
}

function ChannelBadge({ canal, canais }) {
  const s = findCanal(canais, canal);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider"
      style={{ color: s.color, background: `${s.color}22` }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 9999, background: s.color }} />
      {s.label}
    </span>
  );
}

function GradButton({ children, className = "", ...props }) {
  return (
    <button
      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wide text-white ${className}`}
      style={{ background: GRADIENT, boxShadow: "0 6px 18px -6px rgba(240,25,138,0.55)" }}
      {...props}
    >
      {children}
    </button>
  );
}

function HeroBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-6 flex items-center justify-between flex-wrap gap-4"
      style={{ background: `radial-gradient(circle at 15% 20%, rgba(255,122,26,0.35), transparent 55%), radial-gradient(circle at 85% 80%, rgba(147,51,234,0.4), transparent 55%), ${C.panel}`, border: `1px solid ${C.borderStrong}` }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(120deg, rgba(255,255,255,0.02) 0 2px, transparent 2px 24px)" }} />
      <div className="relative z-10 flex items-center gap-3">
        <BrandMark size={34} />
        <div>
          <div className="text-base font-black uppercase tracking-wide" style={{ fontFamily: "'Poppins', sans-serif", color: C.text }}>
            Tudo para imprimir. Tudo para destacar.
          </div>
          <div className="text-xs font-medium mt-0.5" style={{ color: C.textMuted }}>
            Gráfica · Papelaria · Acessórios · Festas — gestão completa num painel só
          </div>
        </div>
      </div>
      <Ribbon tone="gold">Menor preço da região</Ribbon>
    </div>
  );
}

function TrustBar() {
  const items = [
    { icon: Award, title: "Qualidade", sub: "Garantida", color: C.gold },
    { icon: Truck, title: "Entrega", sub: "Rápida", color: C.orange },
    { icon: Headphones, title: "Atendimento", sub: "Especializado", color: C.cyan },
    { icon: Gift, title: "Produtos", sub: "Personalizados", color: C.pink },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <div key={i} className="flex items-center gap-2.5 px-3 py-3 rounded-md" style={{ background: C.panelAlt, border: `1px solid ${C.border}` }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: `${it.color}22` }}>
              <Icon size={15} color={it.color} />
            </div>
            <div className="leading-tight">
              <div className="text-xs font-extrabold uppercase tracking-wide" style={{ color: C.text }}>{it.title}</div>
              <div className="text-[10px] font-semibold" style={{ color: it.color }}>{it.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Main sections ----------
function Kpi({ label, value, delta, positive, gradient }) {
  return (
    <GlowCard className="p-4 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold" style={{ color: C.textMuted }}>
        <Zap size={11} color={C.gold} />
        {label}
      </div>
      <div
        className="text-2xl font-extrabold"
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontVariantNumeric: "tabular-nums",
          ...(gradient
            ? { backgroundImage: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }
            : { color: C.text }),
        }}
      >
        {value}
      </div>
      {delta && (
        <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: positive ? C.green : C.red }}>
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {delta}
        </div>
      )}
    </GlowCard>
  );
}

function Dashboard({ pedidosState, produtos, onOpenPrecos }) {
  const estoqueBaixo = produtos.filter(p => p.estoque < p.minimo);
  const nfPendentes = pedidosState.filter(p => p.status !== "emitida").length;

  return (
    <div className="flex flex-col gap-6">
      <HeroBanner />

      <button
        onClick={onOpenPrecos}
        className="w-full flex items-center justify-between gap-4 p-4 rounded-xl text-left transition-transform hover:-translate-y-0.5"
        style={{ background: C.goldBg, border: `1px solid rgba(255,195,0,0.4)` }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: C.gold }}>
            <Tags size={18} color="#241640" />
          </div>
          <div>
            <div className="text-sm font-extrabold uppercase tracking-wide" style={{ color: C.gold, fontFamily: "'Poppins', sans-serif" }}>
              Tabela de Preços — consulta rápida
            </div>
            <div className="text-xs font-medium" style={{ color: C.textMuted }}>
              Veja e atualize os valores de tudo que a Print Mixx vende, num lugar só
            </div>
          </div>
        </div>
        <ChevronRight size={18} color={C.gold} className="shrink-0" />
      </button>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Vendas hoje" value="R$ 430,00" delta="+12% vs ontem" positive gradient />
        <Kpi label="Ticket médio" value="R$ 61,20" delta="+3,4%" positive />
        <Kpi label="Estoque baixo" value={`${estoqueBaixo.length} itens`} delta="revisar reposição" positive={false} />
        <Kpi label="NF pendentes" value={`${nfPendentes} pedidos`} delta="emitir hoje" positive={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <GlowCard className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wide" style={{ color: C.text, fontFamily: "'Poppins', sans-serif" }}>Vendas — últimos 7 dias</h3>
            <span className="text-[11px] font-mono" style={{ color: C.textMuted }}>total R$ 5.312</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={VENDAS_7D} margin={{ left: -20, right: 10 }}>
              <defs>
                <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.pink} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={C.purple} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="strokeArea" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={C.orange} />
                  <stop offset="100%" stopColor={C.pink} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${C.border}`, background: C.panelAlt, color: C.text }}
                labelStyle={{ color: C.text }}
                formatter={(v) => [`R$ ${v}`, "vendas"]}
              />
              <Area type="monotone" dataKey="total" stroke="url(#strokeArea)" strokeWidth={2.5} fill="url(#fillArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlowCard>

        <GlowCard className="p-5">
          <h3 className="text-sm font-extrabold uppercase tracking-wide mb-4" style={{ color: C.text }}>Por canal</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={CANAL_SPLIT} layout="vertical" margin={{ left: 0, right: 20 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="canal" type="category" tick={{ fontSize: 11, fill: C.textMuted }} axisLine={false} tickLine={false} width={90} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${C.border}`, background: C.panelAlt, color: C.text }}
                formatter={(v) => [`R$ ${v}`, "receita"]}
              />
              <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                {CANAL_SPLIT.map((entry, i) => (
                  <Cell key={i} fill={CANAL_BAR_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlowCard>
      </div>

      <GlowCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={15} color={C.red} />
          <h3 className="text-sm font-extrabold uppercase tracking-wide" style={{ color: C.text, fontFamily: "'Poppins', sans-serif" }}>Reposição urgente</h3>
        </div>
        <div className="flex flex-col">
          {estoqueBaixo.map(p => (
            <div key={p.id} className="flex items-center justify-between py-2.5" style={{ borderTop: `1px solid ${C.border}` }}>
              <div>
                <div className="text-sm font-semibold" style={{ color: C.text }}>{p.nome}</div>
                <div className="text-[11px] font-mono" style={{ color: C.textMuted }}>{p.id}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-bold" style={{ color: C.red }}>{p.estoque} {p.unidade}</div>
                <div className="text-[11px]" style={{ color: C.textMuted }}>mínimo {p.minimo}</div>
              </div>
            </div>
          ))}
        </div>
      </GlowCard>

      <TrustBar />

      <div className="text-center py-2">
        <span
          className="text-sm font-black uppercase tracking-wide"
          style={{ fontFamily: "'Poppins', sans-serif", backgroundImage: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          Sua ideia, nossa impressão!
        </span>
      </div>
    </div>
  );
}

function Estoque({ produtos, setProdutos, categorias }) {
  const [query, setQuery] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");

  const filtered = produtos.filter(p => {
    const matchQuery = p.nome.toLowerCase().includes(query.toLowerCase());
    const matchCat = categoriaAtiva === "Todas" || p.categoria === categoriaAtiva;
    return matchQuery && matchCat;
  });

  const updateProduto = (id, field, value) =>
    setProdutos(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  const removeProduto = (id) => setProdutos(prev => prev.filter(p => p.id !== id));
  const addProduto = () => {
    const novo = {
      id: `NP-${Date.now()}`,
      nome: "Novo Produto",
      categoria: categorias[0]?.id || "",
      estoque: 0,
      minimo: 0,
      custo: 0,
      preco: 0,
      unidade: "un",
    };
    setProdutos(prev => [novo, ...prev]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setCategoriaAtiva("Todas")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wide"
          style={
            categoriaAtiva === "Todas"
              ? { background: GRADIENT, color: "#fff" }
              : { background: C.panelAlt, color: C.textMuted, border: `1px solid ${C.border}` }
          }
        >
          Todas
        </button>
        {categorias.map(cat => {
          const Icon = ICON_LIBRARY[cat.icon] || Tags;
          const active = categoriaAtiva === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wide"
              style={
                active
                  ? { background: cat.color, color: "#fff" }
                  : { background: C.panelAlt, color: C.textMuted, border: `1px solid ${C.border}` }
              }
            >
              <Icon size={13} />
              {cat.label}
            </button>
          );
        })}
        {categorias.length === 0 && (
          <span className="text-xs" style={{ color: C.textMuted }}>
            Nenhuma categoria cadastrada ainda — cadastre em "Cadastros" para poder classificar os produtos.
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color={C.textMuted} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full pl-8 pr-3 py-2 text-sm rounded-md outline-none"
            style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: C.text }}
          />
        </div>
        <GradButton onClick={addProduto}>
          <Plus size={14} /> Novo produto
        </GradButton>
      </div>

      <GlowCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.panelAlt, color: C.textMuted }}>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Produto</th>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Categoria</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Estoque</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Custo</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Preço</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const baixo = p.estoque < p.minimo;
              const cat = findCategoria(categorias, p.categoria);
              return (
                <tr key={p.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td className="px-4 py-2">
                    <input
                      value={p.nome}
                      onChange={e => updateProduto(p.id, "nome", e.target.value)}
                      className="w-full text-sm px-2 py-1.5 rounded-md outline-none font-semibold mb-1"
                      style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: C.text }}
                    />
                    <div className="text-[11px] font-mono px-2" style={{ color: C.textMuted }}>{p.id}</div>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={p.categoria}
                      onChange={e => updateProduto(p.id, "categoria", e.target.value)}
                      className="text-[11px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-md outline-none"
                      style={{ color: cat.color, background: `${cat.color}22`, border: `1px solid ${cat.color}55` }}
                    >
                      {categorias.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                      {!categorias.some(c => c.id === p.categoria) && (
                        <option value={p.categoria}>{cat.label}</option>
                      )}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        step="1"
                        value={p.estoque}
                        onChange={e => updateProduto(p.id, "estoque", parseFloat(e.target.value) || 0)}
                        className="w-16 text-sm px-2 py-1.5 rounded-md outline-none font-mono text-right font-bold"
                        style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: baixo ? C.red : C.text }}
                      />
                      <span className="text-[10px]" style={{ color: C.textMuted }}>{p.unidade}</span>
                    </div>
                    <div className="text-[10px] text-right mt-1" style={{ color: C.textMuted }}>mín. {p.minimo}</div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs" style={{ color: C.textMuted }}>R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={p.custo}
                        onChange={e => updateProduto(p.id, "custo", parseFloat(e.target.value) || 0)}
                        className="w-20 text-sm px-2 py-1.5 rounded-md outline-none font-mono text-right"
                        style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: C.textMuted }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs" style={{ color: C.textMuted }}>R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={p.preco}
                        onChange={e => updateProduto(p.id, "preco", parseFloat(e.target.value) || 0)}
                        className="w-20 text-sm px-2 py-1.5 rounded-md outline-none font-mono text-right font-bold"
                        style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: C.text }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => removeProduto(p.id)} style={{ color: C.red }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlowCard>
    </div>
  );
}

function Vendas({ pedidosState, setPedidosState, canais }) {
  const statusOptions = [
    { value: "aguardando_nf", label: "Aguardando NF" },
    { value: "emitida", label: "NF emitida" },
    { value: "erro", label: "Erro emissão" },
  ];

  const updatePedido = (id, field, value) =>
    setPedidosState(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  const removePedido = (id) => {
    if (!window.confirm("Excluir esse pedido? Isso também some com ele na aba Clientes.")) return;
    setPedidosState(prev => prev.filter(p => p.id !== id));
  };
  const addPedido = () => {
    const novo = {
      id: `#${Math.floor(10000 + Math.random() * 89999)}`,
      cliente: "Novo cliente",
      canal: canais[0]?.id || "",
      itens: "",
      total: 0,
      status: "aguardando_nf",
      data: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setPedidosState(prev => [novo, ...prev]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs" style={{ color: C.textMuted }}>
          Cada linha aqui é um pedido. A aba Clientes é calculada automaticamente a partir
          dessa lista — adicionar, editar ou excluir um pedido atualiza os clientes na hora.
          {canais.length === 0 && " Cadastre ao menos um canal de venda em \"Cadastros\" antes de lançar pedidos."}
        </p>
        <GradButton onClick={addPedido} className="shrink-0">
          <Plus size={14} /> Novo pedido
        </GradButton>
      </div>

      <GlowCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.panelAlt, color: C.textMuted }}>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Pedido</th>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Cliente</th>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Canal</th>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Itens</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Total</th>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Nota Fiscal</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {pedidosState.map(p => (
              <tr key={p.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td className="px-4 py-2 font-mono" style={{ color: C.text }}>{p.id}</td>
                <td className="px-4 py-2">
                  <input
                    value={p.cliente}
                    onChange={e => updatePedido(p.id, "cliente", e.target.value)}
                    className="w-full text-sm px-2 py-1.5 rounded-md outline-none font-semibold"
                    style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: C.text }}
                  />
                </td>
                <td className="px-4 py-2">
                  {(() => {
                    const canalAtual = findCanal(canais, p.canal);
                    return (
                      <select
                        value={p.canal}
                        onChange={e => updatePedido(p.id, "canal", e.target.value)}
                        className="text-[11px] font-bold uppercase tracking-wider px-2 py-1.5 rounded-md outline-none"
                        style={{ color: canalAtual.color, background: `${canalAtual.color}22`, border: `1px solid ${canalAtual.color}55` }}
                      >
                        {canais.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                        {!canais.some(c => c.id === p.canal) && (
                          <option value={p.canal}>{canalAtual.label}</option>
                        )}
                      </select>
                    );
                  })()}
                </td>
                <td className="px-4 py-2">
                  <input
                    value={p.itens}
                    onChange={e => updatePedido(p.id, "itens", e.target.value)}
                    placeholder="Ex: Kit Festa Completo x1"
                    className="w-full text-sm px-2 py-1.5 rounded-md outline-none"
                    style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: C.textMuted, minWidth: 180 }}
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-xs" style={{ color: C.textMuted }}>R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={p.total}
                      onChange={e => updatePedido(p.id, "total", parseFloat(e.target.value) || 0)}
                      className="w-20 text-sm px-2 py-1.5 rounded-md outline-none font-mono text-right font-bold"
                      style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: C.text }}
                    />
                  </div>
                </td>
                <td className="px-4 py-2">
                  <select
                    value={p.status}
                    onChange={e => updatePedido(p.id, "status", e.target.value)}
                    className="text-[11px] font-bold px-2 py-1.5 rounded-md outline-none"
                    style={{ color: C.text, background: C.panelAlt, border: `1px solid ${C.border}` }}
                  >
                    {statusOptions.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => removePedido(p.id)} style={{ color: C.red }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlowCard>
    </div>
  );
}

function Custos({ produtos }) {
  const custosProduto = produtos.map(p => ({
    ...p,
    margem: p.preco > 0 ? (((p.preco - p.custo) / p.preco) * 100).toFixed(0) : "0",
    lucroUn: (p.preco - p.custo).toFixed(2),
  }));

  const custoMedio = produtos.reduce((s, p) => s + p.custo, 0) / (produtos.length || 1);
  const margemMedia =
    custosProduto.reduce((s, p) => s + parseFloat(p.margem), 0) / (custosProduto.length || 1);
  const lucroPotencial = produtos.reduce((s, p) => s + (p.preco - p.custo) * p.estoque, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Kpi label="Custo médio" value={`R$ ${custoMedio.toFixed(2)}`} />
        <Kpi label="Margem média" value={`${margemMedia.toFixed(0)}%`} gradient />
        <Kpi label="Lucro potencial (estoque)" value={`R$ ${lucroPotencial.toFixed(2)}`} />
      </div>
      <GlowCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.panelAlt, color: C.textMuted }}>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Produto</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Custo</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Preço</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Lucro/un</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Margem</th>
            </tr>
          </thead>
          <tbody>
            {custosProduto.map(p => (
              <tr key={p.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td className="px-4 py-2.5 font-semibold" style={{ color: C.text }}>{p.nome}</td>
                <td className="px-4 py-2.5 text-right font-mono" style={{ color: C.textMuted }}>R$ {p.custo.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-right font-mono" style={{ color: C.textMuted }}>R$ {p.preco.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold" style={{ color: C.green }}>R$ {p.lucroUn}</td>
                <td className="px-4 py-2.5 text-right">
                  <span
                    className="font-mono text-xs px-2 py-0.5 rounded-md font-bold"
                    style={{
                      background: p.margem >= 60 ? C.greenBg : p.margem >= 40 ? C.goldBg : C.redBg,
                      color: p.margem >= 60 ? C.green : p.margem >= 40 ? C.gold : C.red,
                    }}
                  >
                    {p.margem}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlowCard>
    </div>
  );
}

function NotasFiscais({ pedidosState, setPedidosState, canais }) {
  const [modo, setModo] = useState("mei");

  const marcarEmitida = (id) => {
    setPedidosState(prev => prev.map(p => (p.id === id ? { ...p, status: "emitida" } : p)));
  };

  const emitidas = pedidosState.filter(p => p.status === "emitida").length;
  const pendentes = pedidosState.filter(p => p.status === "aguardando_nf").length;
  const erros = pedidosState.filter(p => p.status === "erro").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1 p-1 rounded-md w-fit" style={{ background: C.panelAlt }}>
        <button
          onClick={() => setModo("mei")}
          className="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-colors"
          style={modo === "mei" ? { background: GRADIENT, color: "#fff" } : { color: C.textMuted }}
        >
          MEI · emissor gratuito
        </button>
        <button
          onClick={() => setModo("integrado")}
          className="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-colors"
          style={modo === "integrado" ? { background: GRADIENT, color: "#fff" } : { color: C.textMuted }}
        >
          Integrado · Bling/Tiny
        </button>
      </div>

      {modo === "mei" ? (
        <GlowCard className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={15} color={C.gold} />
            <h3 className="text-sm font-extrabold uppercase tracking-wide" style={{ color: C.text, fontFamily: "'Poppins', sans-serif" }}>Emissão manual — MEI</h3>
          </div>
          <p className="text-xs leading-relaxed mb-4" style={{ color: C.textMuted }}>
            Sem custo mensal. Você abre o emissor gratuito (Sefaz do seu estado ou Sebrae), digita os dados do pedido
            usando o certificado digital A1, e depois marca aqui como emitida. Não puxa os pedidos automaticamente —
            é você quem confere Shopee/TikTok Shop e lança um a um.
          </p>
          <div className="flex flex-wrap gap-2">
            <GradButton>
              Emissor da Sefaz do meu estado <ExternalLink size={12} />
            </GradButton>
            <button
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-md"
              style={{ border: `1px solid ${C.border}`, color: C.text }}
            >
              Emissor gratuito Sebrae <ExternalLink size={12} />
            </button>
          </div>
        </GlowCard>
      ) : (
        <GlowCard className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <Receipt size={15} color={C.gold} />
            <h3 className="text-sm font-extrabold uppercase tracking-wide" style={{ color: C.text, fontFamily: "'Poppins', sans-serif" }}>Emissão integrada</h3>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: C.textMuted }}>
            Com um provedor pago (Bling, Tiny, Focus NFe), os pedidos entram automaticamente dos marketplaces e a NF-e
            já sai sem digitação manual — vale a pena quando o volume de vendas crescer além de algumas notas por dia.
          </p>
        </GlowCard>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-md" style={{ background: C.greenBg }}>
          <div className="text-lg font-mono font-extrabold" style={{ color: C.green }}>{emitidas}</div>
          <div className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: C.green }}>emitidas</div>
        </div>
        <div className="p-3 rounded-md" style={{ background: C.goldBg }}>
          <div className="text-lg font-mono font-extrabold" style={{ color: C.gold }}>{pendentes}</div>
          <div className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: C.gold }}>pendentes</div>
        </div>
        <div className="p-3 rounded-md" style={{ background: C.redBg }}>
          <div className="text-lg font-mono font-extrabold" style={{ color: C.red }}>{erros}</div>
          <div className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: C.red }}>com erro</div>
        </div>
      </div>

      <GlowCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.panelAlt, color: C.textMuted }}>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Pedido</th>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Canal</th>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Data</th>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Status</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Ação</th>
            </tr>
          </thead>
          <tbody>
            {pedidosState.map(p => (
              <tr key={p.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td className="px-4 py-2.5 font-mono" style={{ color: C.text }}>{p.id}</td>
                <td className="px-4 py-2.5"><ChannelBadge canal={p.canal} canais={canais} /></td>
                <td className="px-4 py-2.5 font-mono text-xs" style={{ color: C.textMuted }}>{p.data}</td>
                <td className="px-4 py-2.5"><StatusPill status={p.status} /></td>
                <td className="px-4 py-2.5 text-right">
                  {p.status !== "emitida" && modo === "mei" && (
                    <button
                      onClick={() => marcarEmitida(p.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold"
                      style={{ color: C.cyan }}
                    >
                      <Square size={13} /> marquei como emitida
                    </button>
                  )}
                  {p.status !== "emitida" && modo === "integrado" && (
                    <button className="text-xs font-bold underline" style={{ color: C.cyan }}>
                      {p.status === "erro" ? "reprocessar" : "emitir agora"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlowCard>
    </div>
  );
}

function InsumosTab({ insumos, setInsumos }) {
  const updateInsumo = (id, field, value) =>
    setInsumos(prev => prev.map(i => (i.id === id ? { ...i, [field]: value } : i)));
  const addInsumo = () =>
    setInsumos(prev => [...prev, { id: `ins-${Date.now()}`, nome: "Novo insumo", unidade: "un", custo: 0 }]);
  const removeInsumo = (id) => setInsumos(prev => prev.filter(i => i.id !== id));

  return (
    <div className="flex flex-col gap-4">
      <GlowCard className="p-4">
        <p className="text-xs leading-relaxed" style={{ color: C.textMuted }}>
          Base de materiais usada na Composição de Custo e na Precificação. Edite os campos livremente — os cálculos
          das outras abas atualizam sozinhos.
        </p>
      </GlowCard>

      <GlowCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.panelAlt, color: C.textMuted }}>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Insumo</th>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Unidade</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Custo Unitário</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {insumos.map(i => (
              <tr key={i.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td className="px-4 py-2">
                  <input
                    value={i.nome}
                    onChange={e => updateInsumo(i.id, "nome", e.target.value)}
                    className="w-full text-sm px-2 py-1.5 rounded-md outline-none font-semibold"
                    style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: C.text }}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    value={i.unidade}
                    onChange={e => updateInsumo(i.id, "unidade", e.target.value)}
                    className="w-24 text-sm px-2 py-1.5 rounded-md outline-none"
                    style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: C.textMuted }}
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-xs font-mono" style={{ color: C.textMuted }}>R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={i.custo}
                      onChange={e => updateInsumo(i.id, "custo", parseFloat(e.target.value) || 0)}
                      className="w-24 text-sm px-2 py-1.5 rounded-md outline-none font-mono text-right font-bold"
                      style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: C.gold }}
                    />
                  </div>
                </td>
                <td className="px-4 py-2 text-right">
                  <button onClick={() => removeInsumo(i.id)} style={{ color: C.red }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlowCard>

      <button
        onClick={addInsumo}
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide w-fit"
        style={{ color: C.cyan }}
      >
        <Plus size={13} /> adicionar insumo
      </button>
    </div>
  );
}

function CadastrosTab({ categorias, setCategorias, canais, setCanais, produtos, pedidosState }) {
  const updateCategoria = (id, field, value) =>
    setCategorias(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  const addCategoria = () => {
    const nova = {
      id: `cat-${Date.now()}`,
      label: "Nova categoria",
      icon: "Tags",
      color: nextAutoColor(categorias.length),
    };
    setCategorias(prev => [...prev, nova]);
  };
  const removeCategoria = (id) => {
    const emUso = produtos.filter(p => p.categoria === id).length;
    const msg = emUso
      ? `${emUso} produto(s) do Estoque usam essa categoria. Se excluir, eles ficam marcados como "sem categoria". Continuar?`
      : "Excluir essa categoria?";
    if (!window.confirm(msg)) return;
    setCategorias(prev => prev.filter(c => c.id !== id));
  };

  const updateCanal = (id, field, value) =>
    setCanais(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  const addCanal = () => {
    const novo = {
      id: `canal-${Date.now()}`,
      label: "Novo canal",
      color: nextAutoColor(canais.length),
    };
    setCanais(prev => [...prev, novo]);
  };
  const removeCanal = (id) => {
    const emUso = pedidosState.filter(p => p.canal === id).length;
    const msg = emUso
      ? `${emUso} pedido(s) em Vendas usam esse canal. Se excluir, eles continuam com o registro antigo, mas o canal some da lista pra novos pedidos. Continuar?`
      : "Excluir esse canal de venda?";
    if (!window.confirm(msg)) return;
    setCanais(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="flex flex-col gap-8">
      <GlowCard className="p-4">
        <p className="text-xs leading-relaxed" style={{ color: C.textMuted }}>
          Cadastre aqui as categorias de produto e os canais/locais de venda de verdade da Print Mixx.
          Essas listas alimentam o Estoque, as Vendas e a Tabela de Preços — nada de dado fictício fixo no código.
        </p>
      </GlowCard>

      {/* Categorias de produto */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wide" style={{ color: C.text, fontFamily: "'Poppins', sans-serif" }}>
          Categorias de produto
        </h3>
        <GlowCard className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: C.panelAlt, color: C.textMuted }}>
                <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Ícone</th>
                <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Nome</th>
                <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Cor</th>
                <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Em uso</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {categorias.map(cat => {
                const Icon = ICON_LIBRARY[cat.icon] || Tags;
                const emUso = produtos.filter(p => p.categoria === cat.id).length;
                return (
                  <tr key={cat.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td className="px-4 py-2">
                      <select
                        value={cat.icon}
                        onChange={e => updateCategoria(cat.id, "icon", e.target.value)}
                        className="text-sm px-2 py-1.5 rounded-md outline-none"
                        style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: C.text }}
                      >
                        {ICON_LIBRARY_KEYS.map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                      <span className="inline-flex ml-2 align-middle" style={{ color: cat.color }}>
                        <Icon size={16} />
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={cat.label}
                        onChange={e => updateCategoria(cat.id, "label", e.target.value)}
                        className="w-full text-sm px-2 py-1.5 rounded-md outline-none font-semibold"
                        style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: C.text }}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="color"
                        value={cat.color}
                        onChange={e => updateCategoria(cat.id, "color", e.target.value)}
                        className="w-10 h-8 rounded-md outline-none cursor-pointer"
                        style={{ border: `1px solid ${C.border}`, background: "transparent" }}
                      />
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs" style={{ color: C.textMuted }}>
                      {emUso} produto(s)
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => removeCategoria(cat.id)} style={{ color: C.red }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {categorias.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-xs" style={{ color: C.textMuted }}>
                    Nenhuma categoria cadastrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </GlowCard>
        <button
          onClick={addCategoria}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide w-fit"
          style={{ color: C.cyan }}
        >
          <Plus size={13} /> adicionar categoria
        </button>
      </div>

      {/* Canais de venda / local de venda */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wide" style={{ color: C.text, fontFamily: "'Poppins', sans-serif" }}>
          Canais de venda (local de venda)
        </h3>
        <GlowCard className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: C.panelAlt, color: C.textMuted }}>
                <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Nome</th>
                <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Cor</th>
                <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Em uso</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {canais.map(canal => {
                const emUso = pedidosState.filter(p => p.canal === canal.id).length;
                return (
                  <tr key={canal.id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span style={{ width: 8, height: 8, borderRadius: 9999, background: canal.color }} />
                        <input
                          value={canal.label}
                          onChange={e => updateCanal(canal.id, "label", e.target.value)}
                          className="w-full text-sm px-2 py-1.5 rounded-md outline-none font-semibold"
                          style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: C.text }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="color"
                        value={canal.color}
                        onChange={e => updateCanal(canal.id, "color", e.target.value)}
                        className="w-10 h-8 rounded-md outline-none cursor-pointer"
                        style={{ border: `1px solid ${C.border}`, background: "transparent" }}
                      />
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-xs" style={{ color: C.textMuted }}>
                      {emUso} pedido(s)
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button onClick={() => removeCanal(canal.id)} style={{ color: C.red }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {canais.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-xs" style={{ color: C.textMuted }}>
                    Nenhum canal de venda cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </GlowCard>
        <button
          onClick={addCanal}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide w-fit"
          style={{ color: C.cyan }}
        >
          <Plus size={13} /> adicionar canal de venda
        </button>
      </div>
    </div>
  );
}

function ComposicaoTab({ produtosCusteio, setProdutosCusteio, composicao, setComposicao, insumos }) {
  const getInsumo = (id) => insumos.find(i => i.id === id);

  const addItem = (produtoId) =>
    setComposicao(prev => [...prev, { id: `ci-${Date.now()}`, produtoId, insumoId: insumos[0].id, qtd: 1 }]);
  const removeItem = (id) => setComposicao(prev => prev.filter(c => c.id !== id));
  const updateItem = (id, field, value) =>
    setComposicao(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  const renameProduto = (produtoId, nome) =>
    setProdutosCusteio(prev => prev.map(p => (p.id === produtoId ? { ...p, nome } : p)));
  const addProduto = () => {
    const id = `pc-${Date.now()}`;
    setProdutosCusteio(prev => [...prev, { id, nome: "Novo Produto" }]);
    setComposicao(prev => [...prev, { id: `ci-${Date.now()}`, produtoId: id, insumoId: insumos[0].id, qtd: 1 }]);
  };
  const removeProduto = (produtoId) => {
    setProdutosCusteio(prev => prev.filter(p => p.id !== produtoId));
    setComposicao(prev => prev.filter(c => c.produtoId !== produtoId));
  };

  return (
    <div className="flex flex-col gap-4">
      {produtosCusteio.map(produto => {
        const itens = composicao.filter(c => c.produtoId === produto.id);
        const custoTotal = itens.reduce((sum, item) => {
          const insumo = getInsumo(item.insumoId);
          return sum + (insumo ? insumo.custo * (parseFloat(item.qtd) || 0) : 0);
        }, 0);
        return (
          <GlowCard key={produto.id} className="p-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <input
                value={produto.nome}
                onChange={e => renameProduto(produto.id, e.target.value)}
                className="flex-1 text-sm font-extrabold uppercase tracking-wide px-2 py-1.5 rounded-md outline-none"
                style={{ fontFamily: "'Poppins', sans-serif", border: `1px solid ${C.border}`, background: C.panelAlt, color: C.text }}
              />
              <button onClick={() => removeProduto(produto.id)} style={{ color: C.red }}>
                <Trash2 size={15} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {itens.map(item => {
                const insumo = getInsumo(item.insumoId);
                const subtotal = insumo ? insumo.custo * (parseFloat(item.qtd) || 0) : 0;
                return (
                  <div key={item.id} className="flex items-center gap-2 p-2 rounded-md" style={{ background: C.panelAlt }}>
                    <select
                      value={item.insumoId}
                      onChange={e => updateItem(item.id, "insumoId", e.target.value)}
                      className="flex-1 text-sm px-2 py-1.5 rounded-md outline-none"
                      style={{ border: `1px solid ${C.border}`, background: C.bg, color: C.text }}
                    >
                      {insumos.map(i => (
                        <option key={i.id} value={i.id}>{i.nome} — R$ {i.custo.toFixed(2)}/{i.unidade}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.qtd}
                      onChange={e => updateItem(item.id, "qtd", e.target.value)}
                      className="w-20 text-sm px-2 py-1.5 rounded-md outline-none font-mono text-right"
                      style={{ border: `1px solid ${C.border}`, background: C.bg, color: C.text }}
                    />
                    <span className="text-xs font-mono w-20 text-right" style={{ color: C.textMuted }}>
                      R$ {subtotal.toFixed(2)}
                    </span>
                    <button onClick={() => removeItem(item.id)} style={{ color: C.red }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
              <button
                onClick={() => addItem(produto.id)}
                className="flex items-center gap-1 text-xs font-bold"
                style={{ color: C.cyan }}
              >
                <Plus size={13} /> adicionar insumo
              </button>
              <span className="text-sm font-mono font-extrabold" style={{ color: C.gold }}>
                Custo total: R$ {custoTotal.toFixed(2)}
              </span>
            </div>
          </GlowCard>
        );
      })}

      <GradButton onClick={addProduto} className="w-fit px-4 py-2.5">
        <Plus size={14} /> Novo produto
      </GradButton>
    </div>
  );
}

function PrecificacaoTab({ produtosCusteio, composicao, insumos, precificacao, setPrecificacao }) {
  const getInsumo = (id) => insumos.find(i => i.id === id);

  const custoTotalProduto = (produtoId) =>
    composicao
      .filter(c => c.produtoId === produtoId)
      .reduce((sum, item) => {
        const insumo = getInsumo(item.insumoId);
        return sum + (insumo ? insumo.custo * (parseFloat(item.qtd) || 0) : 0);
      }, 0);

  const updatePrecif = (produtoId, field, value) =>
    setPrecificacao(prev => ({ ...prev, [produtoId]: { ...prev[produtoId], [field]: value } }));

  const linhas = produtosCusteio.map(p => {
    const custoTotal = custoTotalProduto(p.id);
    const cfg = precificacao[p.id] || { margem: 0.65, precoPraticado: 0 };
    const precoSugerido = custoTotal / (1 - cfg.margem);
    const lucro = cfg.precoPraticado - custoTotal;
    const margemReal = cfg.precoPraticado > 0 ? lucro / cfg.precoPraticado : 0;
    return { ...p, custoTotal, cfg, precoSugerido, lucro, margemReal };
  });

  const custoMedio = linhas.reduce((s, l) => s + l.custoTotal, 0) / (linhas.length || 1);
  const margemMedia = linhas.reduce((s, l) => s + l.margemReal, 0) / (linhas.length || 1);
  const lucroTotal = linhas.reduce((s, l) => s + l.lucro, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Kpi label="Custo médio" value={`R$ ${custoMedio.toFixed(2)}`} />
        <Kpi label="Margem real média" value={`${(margemMedia * 100).toFixed(0)}%`} gradient />
        <Kpi label="Lucro potencial total" value={`R$ ${lucroTotal.toFixed(2)}`} />
      </div>

      <GlowCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.panelAlt, color: C.textMuted }}>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Produto</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Custo Total</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Margem Desejada</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Preço Sugerido</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Preço Praticado</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Lucro</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Margem Real</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(l => {
              const margemOk = l.margemReal >= l.cfg.margem - 0.02;
              return (
                <tr key={l.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: C.text }}>{l.nome}</td>
                  <td className="px-4 py-2.5 text-right font-mono" style={{ color: C.textMuted }}>R$ {l.custoTotal.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <input
                      type="number"
                      step="1"
                      min="10"
                      max="90"
                      value={Math.round(l.cfg.margem * 100)}
                      onChange={e => updatePrecif(l.id, "margem", (parseFloat(e.target.value) || 0) / 100)}
                      className="w-16 text-sm px-2 py-1 rounded-md outline-none font-mono text-right"
                      style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: C.gold }}
                    />
                    <span className="text-xs ml-1" style={{ color: C.textMuted }}>%</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold" style={{ color: C.cyan }}>R$ {l.precoSugerido.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xs" style={{ color: C.textMuted }}>R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={l.cfg.precoPraticado}
                        onChange={e => updatePrecif(l.id, "precoPraticado", parseFloat(e.target.value) || 0)}
                        className="w-20 text-sm px-2 py-1 rounded-md outline-none font-mono text-right font-bold"
                        style={{ border: `1px solid ${C.border}`, background: C.panelAlt, color: C.text }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold" style={{ color: C.green }}>R$ {l.lucro.toFixed(2)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span
                      className="font-mono text-xs px-2 py-0.5 rounded-md font-bold"
                      style={{
                        background: margemOk ? C.greenBg : C.redBg,
                        color: margemOk ? C.green : C.red,
                      }}
                    >
                      {(l.margemReal * 100).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </GlowCard>

      <p className="text-[11px] leading-relaxed" style={{ color: C.textMuted }}>
        Margem em vermelho = abaixo da margem desejada no preço que você pratica hoje. Ajuste o preço praticado ou
        revise a composição do produto.
      </p>
    </div>
  );
}


function Clientes({ pedidosState, canais }) {
  const CLIENTES = Object.values(
    pedidosState.reduce((acc, p) => {
      if (!acc[p.cliente]) acc[p.cliente] = { nome: p.cliente, canal: p.canal, pedidos: 0, total: 0, ultimo: p.data };
      acc[p.cliente].pedidos += 1;
      acc[p.cliente].total += p.total;
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs" style={{ color: C.textMuted }}>
        Essa lista é calculada automaticamente a partir dos pedidos da aba <strong>Vendas</strong>.
        Pra adicionar, editar ou remover um cliente, mexa nos pedidos dele por lá.
      </p>
      <div className="grid grid-cols-3 gap-3">
        <Kpi label="Clientes ativos" value={CLIENTES.length} />
        <Kpi label="Ticket médio/cliente" value={`R$ ${(CLIENTES.reduce((s, c) => s + c.total, 0) / (CLIENTES.length || 1)).toFixed(2)}`} gradient />
        <Kpi label="Melhor cliente" value={CLIENTES[0]?.nome.split(" ")[0] || "—"} />
      </div>
      <GlowCard className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: C.panelAlt, color: C.textMuted }}>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Cliente</th>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Canal principal</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Pedidos</th>
              <th className="text-right font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Total gasto</th>
              <th className="text-left font-semibold px-4 py-2.5 text-[11px] uppercase tracking-wider">Último pedido</th>
            </tr>
          </thead>
          <tbody>
            {CLIENTES.map((c, i) => (
              <tr key={c.nome} style={{ borderTop: `1px solid ${C.border}` }}>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0"
                      style={{ background: GRADIENT }}
                    >
                      {c.nome.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="font-semibold" style={{ color: C.text }}>{c.nome}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5"><ChannelBadge canal={c.canal} canais={canais} /></td>
                <td className="px-4 py-2.5 text-right font-mono" style={{ color: C.textMuted }}>{c.pedidos}</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold" style={{ color: C.green }}>R$ {c.total.toFixed(2)}</td>
                <td className="px-4 py-2.5 font-mono text-xs" style={{ color: C.textMuted }}>{c.ultimo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlowCard>
    </div>
  );
}

// ---------- Shell ----------
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "precos", label: "Tabela de Preços", icon: Tags, destaque: true },
  { key: "cadastros", label: "Cadastros", icon: Store },
  { key: "estoque", label: "Estoque", icon: Package },
  { key: "insumos", label: "Insumos", icon: Boxes },
  { key: "composicao", label: "Composição de Custo", icon: Layers },
  { key: "precificacao", label: "Precificação", icon: Calculator },
  { key: "vendas", label: "Vendas", icon: ShoppingBag },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "custos", label: "Custos", icon: TrendingUp },
  { key: "nf", label: "Notas Fiscais", icon: Receipt },
];

export default function GestaoApp({ token, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [insumos, setInsumos] = useState(DEFAULT_INSUMOS);
  const [produtosCusteio, setProdutosCusteio] = useState(DEFAULT_PRODUTOS_CUSTEIO);
  const [composicao, setComposicao] = useState(DEFAULT_COMPOSICAO);
  const [precificacao, setPrecificacao] = useState(DEFAULT_PRECIFICACAO);
  const [pedidosState, setPedidosState] = useState(PEDIDOS);
  const [produtos, setProdutos] = useState(DEFAULT_PRODUTOS_ESTOQUE);
  const [categorias, setCategorias] = useState(DEFAULT_CATEGORIAS);
  const [canais, setCanais] = useState(DEFAULT_CANAIS);

  // Carrega os dados do Supabase ao abrir o app (só se o painel tiver banco configurado —
  // sem isso, ele funciona normalmente com os dados de exemplo, sem gravar nada)
  useEffect(() => {
    if (!gestaoSupabaseConfigured) {
      setLoaded(true);
      return;
    }
    (async () => {
      try {
        const [insumosRes, produtosRes, composicaoRes, precifRes, pedidosRes, estoqueRes, categoriasRes, canaisRes] = await Promise.all([
          supabaseGestao.from("insumos").select("*"),
          supabaseGestao.from("produtos_custeio").select("*"),
          supabaseGestao.from("composicao").select("*"),
          supabaseGestao.from("precificacao").select("*"),
          supabaseGestao.from("pedidos").select("*"),
          supabaseGestao.from("produtos_estoque").select("*"),
          supabaseGestao.from("categorias").select("*"),
          supabaseGestao.from("canais").select("*"),
        ]);
        if (insumosRes.data?.length)
          setInsumos(insumosRes.data.map(r => ({ id: r.id, nome: r.nome, unidade: r.unidade, custo: Number(r.custo) })));
        if (produtosRes.data?.length)
          setProdutosCusteio(produtosRes.data.map(r => ({ id: r.id, nome: r.nome })));
        if (composicaoRes.data?.length)
          setComposicao(composicaoRes.data.map(r => ({ id: r.id, produtoId: r.produto_id, insumoId: r.insumo_id, qtd: Number(r.qtd) })));
        if (precifRes.data?.length) {
          const obj = {};
          precifRes.data.forEach(r => { obj[r.produto_id] = { margem: Number(r.margem), precoPraticado: Number(r.preco_praticado) }; });
          setPrecificacao(obj);
        }
        if (pedidosRes.data?.length)
          setPedidosState(pedidosRes.data.map(r => ({ id: r.id, cliente: r.cliente, canal: r.canal, itens: r.itens, total: Number(r.total), status: r.status, data: r.data })));
        if (estoqueRes.data?.length)
          setProdutos(estoqueRes.data.map(r => ({
            id: r.id, nome: r.nome, categoria: r.categoria, estoque: Number(r.estoque),
            minimo: Number(r.minimo), custo: Number(r.custo), preco: Number(r.preco), unidade: r.unidade,
          })));
        if (categoriasRes.data?.length)
          setCategorias(categoriasRes.data.map(r => ({ id: r.id, label: r.label, icon: r.icon, color: r.color })));
        if (canaisRes.data?.length)
          setCanais(canaisRes.data.map(r => ({ id: r.id, label: r.label, color: r.color })));
      } catch (e) {
        console.error("Erro ao carregar do Supabase:", e);
      }
      setLoaded(true);
    })();
  }, []);

  // Sincroniza com o Supabase a cada alteração (com pequeno atraso pra não disparar a cada tecla digitada)
  useEffect(() => {
    if (!loaded || !gestaoSupabaseConfigured) return;
    const timer = setTimeout(async () => {
      try {
        // apaga tudo (tabelas filhas primeiro, por causa das foreign keys)
        await supabaseGestao.from("composicao").delete().neq("id", "");
        await supabaseGestao.from("precificacao").delete().neq("produto_id", "");
        await supabaseGestao.from("produtos_custeio").delete().neq("id", "");
        await supabaseGestao.from("insumos").delete().neq("id", "");
        await supabaseGestao.from("pedidos").delete().neq("id", "");
        await supabaseGestao.from("produtos_estoque").delete().neq("id", "");
        await supabaseGestao.from("categorias").delete().neq("id", "");
        await supabaseGestao.from("canais").delete().neq("id", "");

        // reinsere o estado atual
        if (insumos.length)
          await supabaseGestao.from("insumos").insert(insumos.map(i => ({ id: i.id, nome: i.nome, unidade: i.unidade, custo: i.custo })));
        if (produtosCusteio.length)
          await supabaseGestao.from("produtos_custeio").insert(produtosCusteio.map(p => ({ id: p.id, nome: p.nome })));
        if (composicao.length)
          await supabaseGestao.from("composicao").insert(composicao.map(c => ({ id: c.id, produto_id: c.produtoId, insumo_id: c.insumoId, qtd: c.qtd })));
        const precifRows = Object.entries(precificacao).map(([produtoId, v]) => ({
          produto_id: produtoId, margem: v.margem, preco_praticado: v.precoPraticado,
        }));
        if (precifRows.length) await supabaseGestao.from("precificacao").insert(precifRows);
        if (pedidosState.length)
          await supabaseGestao.from("pedidos").insert(
            pedidosState.map(p => ({ id: p.id, cliente: p.cliente, canal: p.canal, itens: p.itens, total: p.total, status: p.status, data: p.data }))
          );
        if (produtos.length)
          await supabaseGestao.from("produtos_estoque").insert(
            produtos.map(p => ({
              id: p.id, nome: p.nome, categoria: p.categoria, estoque: p.estoque,
              minimo: p.minimo, custo: p.custo, preco: p.preco, unidade: p.unidade,
            }))
          );
        if (categorias.length)
          await supabaseGestao.from("categorias").insert(
            categorias.map(c => ({ id: c.id, label: c.label, icon: c.icon, color: c.color }))
          );
        if (canais.length)
          await supabaseGestao.from("canais").insert(
            canais.map(c => ({ id: c.id, label: c.label, color: c.color }))
          );
        setSaveError(false);
      } catch (e) {
        console.error("Erro ao salvar no Supabase:", e);
        setSaveError(true);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [loaded, insumos, produtosCusteio, composicao, precificacao, pedidosState, produtos, categorias, canais]);

  const resetDados = () => {
    setInsumos(DEFAULT_INSUMOS);
    setProdutosCusteio(DEFAULT_PRODUTOS_CUSTEIO);
    setComposicao(DEFAULT_COMPOSICAO);
    setPrecificacao(DEFAULT_PRECIFICACAO);
    setPedidosState(PEDIDOS);
    setProdutos(DEFAULT_PRODUTOS_ESTOQUE);
    setCategorias(DEFAULT_CATEGORIAS);
    setCanais(DEFAULT_CANAIS);
  };

  const titleMap = {
    dashboard: "Visão geral",
    cadastros: "Cadastros — categorias e canais de venda",
    estoque: "Estoque",
    insumos: "Insumos",
    composicao: "Composição de Custo",
    precificacao: "Precificação",
    precos: "Tabela de Preços — site",
    vendas: "Vendas",
    clientes: "Clientes",
    custos: "Custos & margem",
    nf: "Notas fiscais",
  };

  return (
    <div className="min-h-screen flex" style={{ background: C.bg, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <FontImport />

      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col relative overflow-hidden" style={{ background: "#0D0617", borderRight: `1px solid ${C.border}` }}>
        <div className="px-5 py-6 flex items-center gap-2.5 relative overflow-hidden" style={{ borderBottom: `1px solid ${C.border}` }}>
          <CornerStripes side="right" />
          <div className="relative z-10 flex items-center gap-2.5">
          <BrandMark size={30} />
          <div>
            <div
              className="text-sm font-black tracking-wide uppercase"
              style={{ fontFamily: "'Poppins', sans-serif", backgroundImage: GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            >
              PRINT MIXX
            </div>
            <div className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: C.textMuted }}>Papelaria · Gráfica · Festas</div>
          </div>
          </div>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-0.5 px-3">
          {NAV.map((item, i) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <React.Fragment key={item.key}>
                <button
                  onClick={() => setTab(item.key)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm text-left transition-colors"
                  style={{
                    background: active ? GRADIENT : item.destaque ? C.goldBg : "transparent",
                    color: active ? "#fff" : item.destaque ? C.gold : C.textMuted,
                    fontWeight: active || item.destaque ? 700 : 500,
                    border: !active && item.destaque ? `1px solid rgba(255,195,0,0.35)` : "1px solid transparent",
                  }}
                >
                  <Icon size={15} />
                  {item.label}
                  {item.destaque && !active && (
                    <span
                      className="ml-auto text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ background: C.gold, color: "#241640" }}
                    >
                      consulta
                    </span>
                  )}
                  {active && <ChevronRight size={13} className="ml-auto" />}
                </button>
                {item.destaque && <div className="my-1" style={{ borderTop: `1px solid ${C.border}` }} />}
              </React.Fragment>
            );
          })}
        </nav>
        <div className="px-5 py-4 flex flex-col gap-2" style={{ borderTop: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: C.textMuted }}>
            <MapPin size={11} color={C.gold} /> Protótipo — dados de exemplo
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: C.textMuted }}>
            <Instagram size={11} color={C.pink} /> @printmixx.oficial
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: C.textMuted }}>
            <MessageCircle size={11} color={C.green} /> (81) 98599-2524
          </div>
          <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
            <span className="text-[9px] font-semibold" style={{ color: saveError ? C.red : gestaoSupabaseConfigured ? C.green : C.gold }}>
              {saveError
                ? "⚠ erro ao salvar"
                : !gestaoSupabaseConfigured
                ? "● modo local (sem banco)"
                : loaded ? "✓ dados salvos" : "carregando..."}
            </span>
            <button
              onClick={() => { if (window.confirm("Restaurar dados de exemplo? Isso apaga suas alterações salvas.")) resetDados(); }}
              className="text-[9px] font-semibold underline"
              style={{ color: C.textMuted }}
            >
              restaurar exemplo
            </button>
          </div>
          <div className="flex items-center justify-between mt-1 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
            <a
              href="/"
              className="text-[9px] font-semibold underline"
              style={{ color: C.textMuted }}
            >
              ← voltar ao site
            </a>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide"
              style={{ color: C.red }}
            >
              <LogOut size={11} /> sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 90% 0%, rgba(147,51,234,0.14), transparent 40%), radial-gradient(circle at 0% 90%, rgba(240,25,138,0.10), transparent 40%)`,
          }}
        />
        <header className="px-8 py-5 flex items-center justify-between relative overflow-hidden" style={{ borderBottom: `1px solid ${C.border}` }}>
          <CornerStripes side="right" />
          <div className="flex items-center gap-3">
            <h1
              className="text-lg font-extrabold uppercase tracking-wide"
              style={{ fontFamily: "'Poppins', sans-serif", color: C.text }}
            >
              {titleMap[tab]}
            </h1>
            {tab === "dashboard" && <Ribbon tone="gold">Menor preço da região</Ribbon>}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono relative z-10" style={{ color: C.textMuted }}>
            <Store size={13} />
            {canais.length} {canais.length === 1 ? "canal" : "canais"} de venda cadastrado{canais.length === 1 ? "" : "s"}
          </div>
        </header>
        <div className="p-8 relative z-10">
          {tab === "dashboard" && <Dashboard pedidosState={pedidosState} produtos={produtos} onOpenPrecos={() => setTab("precos")} />}
          {tab === "cadastros" && (
            <CadastrosTab
              categorias={categorias}
              setCategorias={setCategorias}
              canais={canais}
              setCanais={setCanais}
              produtos={produtos}
              pedidosState={pedidosState}
            />
          )}
          {tab === "estoque" && <Estoque produtos={produtos} setProdutos={setProdutos} categorias={categorias} />}
          {tab === "insumos" && <InsumosTab insumos={insumos} setInsumos={setInsumos} />}
          {tab === "composicao" && (
            <ComposicaoTab
              produtosCusteio={produtosCusteio}
              setProdutosCusteio={setProdutosCusteio}
              composicao={composicao}
              setComposicao={setComposicao}
              insumos={insumos}
            />
          )}
          {tab === "precificacao" && (
            <PrecificacaoTab
              produtosCusteio={produtosCusteio}
              composicao={composicao}
              insumos={insumos}
              precificacao={precificacao}
              setPrecificacao={setPrecificacao}
            />
          )}
          {tab === "precos" && <PrecosTab token={token} categorias={categorias} />}
          {tab === "vendas" && <Vendas pedidosState={pedidosState} setPedidosState={setPedidosState} canais={canais} />}
          {tab === "clientes" && <Clientes pedidosState={pedidosState} canais={canais} />}
          {tab === "custos" && <Custos produtos={produtos} />}
          {tab === "nf" && <NotasFiscais pedidosState={pedidosState} setPedidosState={setPedidosState} canais={canais} />}
        </div>
      </main>
    </div>
  );
}
