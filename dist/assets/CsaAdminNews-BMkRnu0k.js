import{s as q}from"./index-Rt97XOwF.js";import{s as E,n as I,a as L,b as M}from"./const-D-wBS8Qj.js";import{B as W,o as c,d as g,c as D,A as k,D as Y,k as C,C as G,e as s,t as h,E as H,_ as J,cl as K,W as O,a5 as Q,a as u,a3 as X,g as t,Y as d,a1 as B,w as p,F as x,i as Z,z as ee,f as ne}from"./index-BhkxUP3L.js";import{_ as ae}from"./CsaEditNews-BIgB4EpN.js";import"./index-CBJieuyh.js";import"./index-CgkEdoiB.js";import"./index-BK4a2wFn.js";import"./imageUtils-DvtRU3aV.js";var te=function(l){var e=l.dt;return`
.p-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: `.concat(e("tag.primary.background"),`;
    color: `).concat(e("tag.primary.color"),`;
    font-size: `).concat(e("tag.font.size"),`;
    font-weight: `).concat(e("tag.font.weight"),`;
    padding: `).concat(e("tag.padding"),`;
    border-radius: `).concat(e("tag.border.radius"),`;
    gap: `).concat(e("tag.gap"),`;
}

.p-tag-icon {
    font-size: `).concat(e("tag.icon.size"),`;
    width: `).concat(e("tag.icon.size"),`;
    height:`).concat(e("tag.icon.size"),`;
}

.p-tag-rounded {
    border-radius: `).concat(e("tag.rounded.border.radius"),`;
}

.p-tag-success {
    background: `).concat(e("tag.success.background"),`;
    color: `).concat(e("tag.success.color"),`;
}

.p-tag-info {
    background: `).concat(e("tag.info.background"),`;
    color: `).concat(e("tag.info.color"),`;
}

.p-tag-warn {
    background: `).concat(e("tag.warn.background"),`;
    color: `).concat(e("tag.warn.color"),`;
}

.p-tag-danger {
    background: `).concat(e("tag.danger.background"),`;
    color: `).concat(e("tag.danger.color"),`;
}

.p-tag-secondary {
    background: `).concat(e("tag.secondary.background"),`;
    color: `).concat(e("tag.secondary.color"),`;
}

.p-tag-contrast {
    background: `).concat(e("tag.contrast.background"),`;
    color: `).concat(e("tag.contrast.color"),`;
}
`)},oe={root:function(l){var e=l.props;return["p-tag p-component",{"p-tag-info":e.severity==="info","p-tag-success":e.severity==="success","p-tag-warn":e.severity==="warn","p-tag-danger":e.severity==="danger","p-tag-secondary":e.severity==="secondary","p-tag-contrast":e.severity==="contrast","p-tag-rounded":e.rounded}]},icon:"p-tag-icon",label:"p-tag-label"},se=W.extend({name:"tag",theme:te,classes:oe}),re={name:"BaseTag",extends:H,props:{value:null,severity:null,rounded:Boolean,icon:String},style:se,provide:function(){return{$pcTag:this,$parentInstance:this}}},N={name:"Tag",extends:re,inheritAttrs:!1};function ce(n,l,e,S,T,$){return c(),g("span",k({class:n.cx("root")},n.ptmi("root")),[n.$slots.icon?(c(),D(Y(n.$slots.icon),k({key:0,class:n.cx("icon")},n.ptm("icon")),null,16,["class"])):n.icon?(c(),g("span",k({key:1,class:[n.cx("icon"),n.icon]},n.ptm("icon")),null,16)):C("",!0),n.value!=null||n.$slots.default?G(n.$slots,"default",{key:2},function(){return[s("span",k({class:n.cx("label")},n.ptm("label")),h(n.value),17)]}):C("",!0)],16)}N.render=ce;const le={class:"main-part-lg mx-auto"},ie={class:"min-w-48"},de={key:0,class:"flex gap-1"},pe={class:"pagination-wrapper"},ue={__name:"CsaAdminNews",setup(n){const l=K(),e=Z("axios"),S=O(),T=Q(()=>S.admin_role_id===7),$=u([]),m=u(!1),v=u(1),P=u(0),f=u(10),z=u(null),j=(r,o)=>{l.require({target:r.currentTarget,message:"确认删除该信息？",icon:"pi pi-exclamation-triangle",rejectProps:{label:"取消",severity:"secondary",outlined:!0},acceptProps:{label:"删除",severity:"danger"},accept:()=>{e.post("/delete/news",{nid:o}).then(()=>{y(),window.notyf.success("删除成功")})}})},A=r=>{l.require({target:r.currentTarget,message:"确认清理所有24小时前的废弃草稿？此操作将删除旧草稿及其关联图片，且不可恢复。",icon:"pi pi-exclamation-triangle",rejectProps:{label:"取消",severity:"secondary",outlined:!0},acceptProps:{label:"清理",severity:"danger"},accept:()=>{e.post("/admin/cleanup_drafts").then(o=>{const b=o.data.details||{news_deleted:0,events_deleted:0};window.notyf.success(`清理完成: 删除新闻草稿${b.news_deleted}条, 活动草稿${b.events_deleted}条`)})}})},y=()=>{e.get("/news/list",{params:{page:v.value,size:f.value}}).then(r=>{$.value=r.data})};return e.get("/news/count").then(r=>{P.value=r.data.count}).then(()=>{y()}),X([v,f],()=>{y()}),(r,o)=>{const b=ae,U=L,w=ee,i=M,F=N,R=E,V=q;return c(),g(x,null,[t(b,{show:d(m),"onUpdate:show":o[0]||(o[0]=a=>B(m)?m.value=a:null),onFinish:y,nid:d(z)},null,8,["show","nid"]),t(U),s("div",le,[o[4]||(o[4]=s("div",{class:"text-3xl font-bold mb-6"},"信息管理",-1)),t(w,{label:"创建信息",class:"mb-4",onClick:o[1]||(o[1]=()=>{m.value=!0,z.value=null})}),T.value?(c(),D(w,{key:0,label:"清理废弃草稿",class:"mb-4 ml-2",severity:"warning",onClick:A})):C("",!0),t(R,{value:d($),class:"mb-4"},{default:p(()=>[t(i,{field:"nid",header:"编号"}),t(i,{field:"title",header:"标题"},{body:p(({data:a})=>[s("div",ie,h(a.title),1)]),_:1}),t(i,{field:"category",header:"类型"},{body:p(({data:a})=>[s("div",null,h(d(I)[a.category]),1)]),_:1}),t(i,{field:"tag",header:"标签"},{body:p(({data:a})=>[a.tag?(c(),g("div",de,[(c(!0),g(x,null,ne(a.tag.split(" "),_=>(c(),g("div",{key:_},[t(F,{value:_,class:"text-nowrap"},null,8,["value"])]))),128))])):C("",!0)]),_:1}),t(i,{field:"last_update",header:"上次更新"},{body:p(({data:a})=>[s("div",null,h(new Date(a.last_update*1e3).toLocaleString()),1)]),_:1}),t(i,{field:"edit",header:"编辑"},{body:p(({data:a})=>[s("div",null,[t(w,{label:"编辑",size:"small",class:"whitespace-nowrap",onClick:()=>{z.value=a.nid,m.value=!0}},null,8,["onClick"])])]),_:1}),t(i,{field:"delete",header:"删除"},{body:p(({data:a})=>[s("div",null,[t(w,{label:"删除",severity:"danger",size:"small",class:"whitespace-nowrap",onClick:_=>j(_,a.nid)},null,8,["onClick"])])]),_:1})]),_:1},8,["value"]),s("div",pe,[t(V,{page:d(v),"onUpdate:page":o[2]||(o[2]=a=>B(v)?v.value=a:null),rows:d(f),"onUpdate:rows":o[3]||(o[3]=a=>B(f)?f.value=a:null),totalRecords:d(P)},null,8,["page","rows","totalRecords"])])])],64)}}},ke=J(ue,[["__scopeId","data-v-e8035d3f"]]);export{ke as default};
