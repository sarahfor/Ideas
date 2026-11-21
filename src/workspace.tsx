"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { BookOpen, Search, Plus, Pencil, Copy, Check, PanelRightClose, PanelRightOpen, NotebookPen, Sparkles, LockKeyhole, Layers, X, ExternalLink, FlaskConical, FileText, ChevronDown, Menu, Download, Globe, HardDrive } from "lucide-react";
import { seedNotes, type ProjectNote } from "./note-data";

import { readNotes, saveNote, storageKey, type Draft } from "./storage";
const repositoryUrl = "https://github.com/sarahfor/Ideas";
const demoUrl = `${import.meta.env.BASE_URL}demos/hot-cold.html`;
const emptyDraft: Draft = {title:"",summary:"",body:"",category:"Project idea",status:"Idea"};

function Inline({text}:{text:string}) {
  const parts = text.split(/(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|\*\*[^*]+\*\*)/g);
  return <>{parts.map((part,i) => {
    const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
    if (link) return <a key={i} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2,-2)}</strong>;
    return part;
  })}</>;
}

function Markdown({text}:{text:string}) {
  return <div className="prose">{text.split(/\n\s*\n/).map((block,i) => {
    if (/^#{1,3} /.test(block)) {
      const lines=block.split("\n");
      return <section key={i}><h2>{lines[0].replace(/^#{1,3} /,"")}</h2>{lines.length>1?<Markdown text={lines.slice(1).join("\n")}/>:null}</section>;
    }
    if (block.split("\n").every(line=>line.startsWith("- "))) return <ul key={i}>{block.split("\n").map((line,j)=><li key={j}><Inline text={line.slice(2)}/></li>)}</ul>;
    return <p key={i}><Inline text={block}/></p>;
  })}</div>;
}

function IconButton({label,children,onClick}:{label:string;children:ReactNode;onClick:()=>void}) { return <button className="icon-button" type="button" aria-label={label} title={label} onClick={onClick}>{children}</button>; }

export default function Workspace() {
  const [notes,setNotes]=useState<ProjectNote[]>(seedNotes);
  const [selected,setSelected]=useState("hot-cold");
  const [query,setQuery]=useState("");
  const [filter,setFilter]=useState("All notes");
  const [assistant,setAssistant]=useState(true);
  const [mobileLibrary,setMobileLibrary]=useState(false);
  const [tab,setTab]=useState<"note"|"preview">("note");
  const [loadState,setLoadState]=useState<"loading"|"ready"|"error">("loading");
  const [loadError,setLoadError]=useState("");
  const [editing,setEditing]=useState<ProjectNote|null>(null);
  const [draft,setDraft]=useState<Draft>(emptyDraft);
  const [saving,setSaving]=useState(false);
  const [saveError,setSaveError]=useState("");
  const [notice,setNotice]=useState("");
  const [prompt,setPrompt]=useState("");
  const [copied,setCopied]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const note=notes.find(n=>n.id===selected) ?? notes[0];
  const isDemo=note?.id==="hot-cold";

  function loadNotes() {
    setLoadError("");
    try { setNotes(readNotes(localStorage)); setLoadState("ready"); }
    catch { setLoadState("error"); setLoadError("Browser notes are unavailable. Saved data has been left unchanged. You can still read the published notes."); }
  }
  useEffect(()=>{
    if (window.matchMedia("(max-width:800px)").matches) setAssistant(false);
    const requested=new URLSearchParams(location.search).get("note");
    if(requested)setSelected(requested);
    loadNotes();
    const pop=()=>{setSelected(new URLSearchParams(location.search).get("note")||"hot-cold");setTab("note");};
    const storageChanged = (event: StorageEvent) => { if (event.key === storageKey || event.key === null) loadNotes(); };
    window.addEventListener("popstate",pop);window.addEventListener("storage",storageChanged);
    return()=>{window.removeEventListener("popstate",pop);window.removeEventListener("storage",storageChanged);};
  },[]);
  useEffect(()=>{setPrompt("");setCopied(false);},[selected]);
  useEffect(()=>{if(!notice)return;const t=setTimeout(()=>setNotice(""),3500);return()=>clearTimeout(t);},[notice]);
  function choose(id:string) {setSelected(id);setTab("note");setMobileLibrary(false);history.pushState({},"","?note="+encodeURIComponent(id));document.querySelector(".note-scroll")?.scrollTo({top:0});}
  function openEditor(current:ProjectNote|null) {setEditing(current);setDraft(current?{title:current.title,summary:current.summary,body:current.body,category:current.category,status:current.status}:{...emptyDraft});setSaveError("");dialog.current?.showModal();}
  async function save(event:FormEvent) {
    event.preventDefault();if(saving)return;setSaving(true);setSaveError("");
    try {
      const savedNote=saveNote(localStorage,draft,editing);
      setNotes(readNotes(localStorage));
      choose(savedNote.id);dialog.current?.close();setNotice("Note saved in this browser");
    } catch(error) {setSaveError(error instanceof Error?error.message:"Could not save this note. Your edits are still here.");}
    finally {setSaving(false);}
  }
  async function copyContext() {
    if(!note)return;
    const text=`Project: ${note.title}\nStatus: ${note.status}\n\n${note.summary}\n\n${note.body}${isDemo?"\n\nInteractive preview: concept simulation only; no live phone ranging or Oasis connection.":""}${prompt.trim()?"\n\nMy question: "+prompt.trim():""}`;
    try {await navigator.clipboard.writeText(text);setCopied(true);setNotice("Project context copied");setTimeout(()=>setCopied(false),2500);}catch{setNotice("Clipboard unavailable. Use Export note to keep a copy.");}
  }
  function exportNote() {
    if(!note)return;
    const blob=new Blob([`# ${note.title}\n\n${note.summary}\n\n${note.body}\n`],{type:"text/markdown;charset=utf-8"});
    const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=note.title.replace(/[^a-z0-9]+/gi,"-").toLowerCase()+".md";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function exportAll() {
    const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),notes},null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="project-studio-notes.json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  const visible=notes.filter(n=>(filter==="All notes"||n.status===filter)&&`${n.title} ${n.summary} ${n.body} ${n.category}`.toLowerCase().includes(query.toLowerCase()));
  const updated=note?new Date(note.updatedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric",timeZone:"America/New_York"}):"";

  return <div className={`workspace ${assistant?"with-assistant":""}`}>
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Layers size={21}/></div><span>Project Studio</span><span className="brand-slash">/</span><span className="owner-name">Sarah Forrest</span></div>
      <div className="top-actions"><a className="private-label repository-link" href={repositoryUrl} target="_blank" rel="noreferrer"><Globe size={14}/> On GitHub</a><button className="button primary" disabled={loadState!=="ready"} onClick={()=>openEditor(null)}><Plus size={16}/><span>New note</span></button></div>
    </header>
    <aside className={`library ${mobileLibrary?"mobile-open":""}`} aria-label="Project notes library">
      <div className="library-heading"><span>YOUR WORKSPACE</span><span className="note-count">{notes.length}</span><button className="icon-button mobile-close" aria-label="Close notes library" onClick={()=>setMobileLibrary(false)}><X size={18}/></button></div>
      <label className="search-field"><Search size={16}/><input aria-label="Search project notes" placeholder="Find a note…" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button aria-label="Clear search" onClick={()=>setQuery("")}><X size={14}/></button>}</label>
      <div className="filter-row"><BookOpen size={15}/><select aria-label="Filter project notes" value={filter} onChange={e=>setFilter(e.target.value)}>{["All notes","Idea","Prototype","In progress","Complete"].map(f=><option key={f}>{f}</option>)}</select><ChevronDown size={13}/></div>
      <nav className="note-list">{visible.map(n=><button className={`note-item ${note?.id===n.id?"selected":""}`} key={n.id} onClick={()=>choose(n.id)} aria-current={note?.id===n.id?"page":undefined}>
        <span className={`note-icon ${n.id==="hot-cold"?"warm":""}`}>{n.id==="hot-cold"?<FlaskConical size={19}/>:<NotebookPen size={19}/>}</span>
        <span className="note-item-copy"><strong>{n.title}</strong><span>{n.category}</span><small>{n.status}{n.id==="hot-cold"?" · Interactive preview":""}</small></span>
      </button>)}{visible.length===0&&<p className="no-results">No notes match. Try another search or filter.</p>}</nav>
      <button className="add-note" disabled={loadState!=="ready"} onClick={()=>openEditor(null)}><Plus size={16}/> Capture a new idea</button>
      <button className="add-note export-all" onClick={exportAll}><Download size={16}/> Export all notes</button>
      <div className="library-bottom"><div className="avatar">SF</div><div><strong>Sarah’s studio</strong><span>Ideas, in progress.</span></div></div>
    </aside>
    <main className="main-panel">
      <div className="note-toolbar"><div className="breadcrumb"><button className="icon-button mobile-menu" aria-label="Open notes library" onClick={()=>setMobileLibrary(true)}><Menu size={18}/></button><BookOpen size={15}/><span>Project notes</span><span className="breadcrumb-slash">/</span><strong>{note?.title}</strong></div><div className="toolbar-actions"><IconButton label="Export note" onClick={exportNote}><Download size={16}/></IconButton><IconButton label={assistant?"Hide Astra panel":"Show Astra panel"} onClick={()=>setAssistant(!assistant)}>{assistant?<PanelRightClose size={18}/>:<PanelRightOpen size={18}/>}</IconButton></div></div>
      <div className="note-scroll">
        <div className="storage-notice"><HardDrive size={15}/><span>Edits save in this browser. Export a copy to keep them.</span></div>
        {loadState==="error"&&<div className="connection-message" role="alert"><span>{loadError}</span><button className="button small" onClick={loadNotes}>Retry</button></div>}
        {note&&<article className="project-note">
          <div className="eyebrow"><span>{note.category}</span><span className={`status ${note.status.toLowerCase().replaceAll(" ","-")}`}>{note.status}</span></div>
          <div className="title-row"><h1>{note.title}</h1><button className="button subtle edit-button" disabled={loadState!=="ready"} onClick={()=>openEditor(note)}><Pencil size={15}/> Edit note</button></div>
          <p className="project-summary">{note.summary}</p>
          <div className="note-meta"><span className="author-dot">SF</span><span>Sarah Forrest</span><span className="meta-separator">·</span><span>Updated {updated}</span><span className="meta-separator">·</span><span>{note.revision>0?"Browser draft":"Published note"}</span>{loadState==="loading"&&<span className="loading-label">Loading browser notes…</span>}</div>
          <div className="tabs" role="tablist" aria-label="Note views"><button role="tab" id="note-tab" aria-controls="note-view" aria-selected={tab==="note"} className={tab==="note"?"active":""} onClick={()=>setTab("note")}><FileText size={15}/> Project note</button>{isDemo&&<button role="tab" id="preview-tab" aria-controls="preview-view" aria-selected={tab==="preview"} className={tab==="preview"?"active":""} onClick={()=>setTab("preview")}><FlaskConical size={15}/> Interactive preview</button>}</div>
          <div id="note-view" role="tabpanel" aria-labelledby="note-tab" hidden={tab!=="note"}>
            {isDemo&&<button className="preview-teaser" onClick={()=>setTab("preview")} aria-label="Open the Hot Cold interactive preview">
              <div className="teaser-copy"><span className="teaser-kicker">TRY THE CONCEPT</span><h2>A little warmer.<br/>A little closer.</h2><span className="teaser-action"><FlaskConical size={16}/> Open interactive preview</span></div>
              <div className="teaser-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><span className="cold-orb"/><span className="warm-orb"/><span className="connecting-line"/><span className="cold-caption">COLD</span><span className="warm-caption">HOT</span></div>
            </button>}
            {note.id==="intro-format"?<div className="intro-note"><span className="small-label">A NOTE FOR EACH INTRO</span><blockquote>{note.body}</blockquote><div className="intro-sequence"><span><Pencil size={17}/> Whiteboard sketch</span><span className="sequence-divider"/><span><FlaskConical size={17}/> Visual demo</span></div></div>:<Markdown text={note.body}/>}
            {isDemo&&<div className="source-note"><ExternalLink size={14}/><a href={repositoryUrl} target="_blank" rel="noreferrer">View project source on GitHub</a><span>Published notes come from this repository. Browser edits stay on this device.</span></div>}
          </div>
          {isDemo&&<div id="preview-view" role="tabpanel" aria-labelledby="preview-tab" hidden={tab!=="preview"}><div className="preview-intro"><h2>Walk past the target</h2><p>Move the slider to explore how distance changes the phone’s feedback and a proposed light response.</p></div><div className="demo-frame"><iframe src={demoUrl} title="Hot Cold interactive proximity simulation" sandbox="allow-scripts allow-same-origin"/></div><p className="demo-caption">Concept simulation. No phones, tags, or Oasis lights are connected.</p><a className="text-link" href={demoUrl} target="_blank" rel="noreferrer"><ExternalLink size={14}/> Open preview in a new tab</a></div>}
          <div className="note-end"><span/><Layers size={16}/><span/></div>
        </article>}
      </div>
    </main>
    {assistant&&<aside className="assistant-panel" aria-label="Astra project assistant"><div className="assistant-header"><div><Sparkles size={19}/><strong>Astra</strong></div><div><span className="assistant-badge">Connect later</span><IconButton label="Close Astra panel" onClick={()=>setAssistant(false)}><X size={16}/></IconButton></div></div><div className="assistant-body"><div className="context-label"><span className="context-square"/><span>Project context</span></div><div className="context-note"><FileText size={16}/><span>{note?.title}</span></div><div className="assistant-welcome"><div className="assistant-emblem"><Sparkles size={28} strokeWidth={1.3}/></div><h2>A thinking partner<br/>for what’s next.</h2><p>Keep the conversation beside the idea. Astra will use the selected note as context once connected.</p></div><div className="assistant-connection"><LockKeyhole size={15}/><span>Astra isn’t connected yet.</span></div><p className="prompt-label">Questions to pick up later</p><div className="suggested-prompts">{["What should I build first?","Help me sharpen this idea.","What still needs testing?"].map(p=><button key={p} onClick={()=>setPrompt(p)} className={prompt===p?"chosen":""}>{p}</button>)}</div><div className="assistant-spacer"/><label className="compose-label" htmlFor="project-question">Draft a question</label><textarea id="project-question" className="assistant-composer" value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="What would you like to explore?" maxLength={4000}/><button className="button copy-context" onClick={copyContext}>{copied?<Check size={16}/>:<Copy size={16}/>} {copied?"Copied":"Copy note + question"}</button><p className="assistant-footer">Your question is copied with this note.<br/>Nothing is sent to an AI service.</p></div></aside>}
    <dialog ref={dialog} className="editor-dialog" onCancel={e=>{if(saving)e.preventDefault();}}><form onSubmit={save}><div className="dialog-heading"><div><span className="small-label">PROJECT STUDIO</span><h2>{editing?"Edit project note":"Capture a new idea"}</h2></div><button type="button" className="icon-button" aria-label="Close editor" disabled={saving} onClick={()=>dialog.current?.close()}><X size={20}/></button></div><p className="editor-storage-note">Saved on this device. Changes here do not update the published site.</p><label>Title<input autoFocus required maxLength={160} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="Give your idea a name"/></label><label>Short description<textarea rows={2} maxLength={500} value={draft.summary} onChange={e=>setDraft({...draft,summary:e.target.value})} placeholder="What is it, and why does it matter?"/></label><div className="editor-row"><label>Category<input maxLength={100} value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}/></label><label>Status<select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value as ProjectNote["status"]})}>{["Idea","Prototype","In progress","Complete"].map(s=><option key={s}>{s}</option>)}</select></label></div><label>Project note<textarea rows={12} maxLength={50000} value={draft.body} onChange={e=>setDraft({...draft,body:e.target.value})} placeholder="Sketch the idea, capture decisions, and list what comes next."/></label><span className="editor-hint">Use ## for headings, - for lists, and [label](https://…) for links.</span>{saveError&&<p className="form-error" role="alert">{saveError}</p>}<div className="dialog-actions"><button type="button" className="button" disabled={saving} onClick={()=>dialog.current?.close()}>Cancel</button><button type="submit" className="button primary" disabled={saving||!draft.title.trim()}>{saving?"Saving…":"Save on this device"}</button></div></form></dialog>
    {notice&&<div className="toast" role="status"><Check size={16}/>{notice}</div>}
  </div>;
}
