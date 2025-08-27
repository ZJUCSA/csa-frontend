import{s as F}from"./index-DDMaMm2E.js";import{s as R,n as U,a as V,b as E}from"./const-g4TjG4Ei.js";import{B as L,o as i,d as f,c as q,A as w,D as I,k as z,C as O,e as s,t as h,E as Y,cl as G,a as m,a6 as H,g as t,Y as c,a4 as C,w as l,F as P,i as J,z as K,f as M}from"./index-CKR_brnM.js";import{_ as Q}from"./CsaEditNews-BLWy0cEq.js";import"./index-BD2JbZbI.js";import"./index-CLnpRIo0.js";import"./index-CzHDIDRU.js";var W=function(d){var n=d.dt;return`
.p-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: `.concat(n("tag.primary.background"),`;
    color: `).concat(n("tag.primary.color"),`;
    font-size: `).concat(n("tag.font.size"),`;
    font-weight: `).concat(n("tag.font.weight"),`;
    padding: `).concat(n("tag.padding"),`;
    border-radius: `).concat(n("tag.border.radius"),`;
    gap: `).concat(n("tag.gap"),`;
}

.p-tag-icon {
    font-size: `).concat(n("tag.icon.size"),`;
    width: `).concat(n("tag.icon.size"),`;
    height:`).concat(n("tag.icon.size"),`;
}

.p-tag-rounded {
    border-radius: `).concat(n("tag.rounded.border.radius"),`;
}

.p-tag-success {
    background: `).concat(n("tag.success.background"),`;
    color: `).concat(n("tag.success.color"),`;
}

.p-tag-info {
    background: `).concat(n("tag.info.background"),`;
    color: `).concat(n("tag.info.color"),`;
}

.p-tag-warn {
    background: `).concat(n("tag.warn.background"),`;
    color: `).concat(n("tag.warn.color"),`;
}

.p-tag-danger {
    background: `).concat(n("tag.danger.background"),`;
    color: `).concat(n("tag.danger.color"),`;
}

.p-tag-secondary {
    background: `).concat(n("tag.secondary.background"),`;
    color: `).concat(n("tag.secondary.color"),`;
}

.p-tag-contrast {
    background: `).concat(n("tag.contrast.background"),`;
    color: `).concat(n("tag.contrast.color"),`;
}
`)},X={root:function(d){var n=d.props;return["p-tag p-component",{"p-tag-info":n.severity==="info","p-tag-success":n.severity==="success","p-tag-warn":n.severity==="warn","p-tag-danger":n.severity==="danger","p-tag-secondary":n.severity==="secondary","p-tag-contrast":n.severity==="contrast","p-tag-rounded":n.rounded}]},icon:"p-tag-icon",label:"p-tag-label"},Z=L.extend({name:"tag",theme:W,classes:X}),nn={name:"BaseTag",extends:Y,props:{value:null,severity:null,rounded:Boolean,icon:String},style:Z,provide:function(){return{$pcTag:this,$parentInstance:this}}},T={name:"Tag",extends:nn,inheritAttrs:!1};function an(a,d,n,k,p,u){return i(),f("span",w({class:a.cx("root")},a.ptmi("root")),[a.$slots.icon?(i(),q(I(a.$slots.icon),w({key:0,class:a.cx("icon")},a.ptm("icon")),null,16,["class"])):a.icon?(i(),f("span",w({key:1,class:[a.cx("icon"),a.icon]},a.ptm("icon")),null,16)):z("",!0),a.value!=null||a.$slots.default?O(a.$slots,"default",{key:2},function(){return[s("span",w({class:a.cx("label")},a.ptm("label")),h(a.value),17)]}):z("",!0)],16)}T.render=an;const en={class:"main-part-lg mx-auto"},tn={class:"min-w-48"},on={key:0,class:"flex gap-1"},sn={class:"flex justify-end"},mn={__name:"CsaAdminNews",setup(a){const d=G(),n=J("axios"),k=m([]),p=m(!1),u=m(1),B=m(0),v=m(10),_=m(null),D=(g,o)=>{d.require({target:g.currentTarget,message:"确认删除该信息？",icon:"pi pi-exclamation-triangle",rejectProps:{label:"取消",severity:"secondary",outlined:!0},acceptProps:{label:"删除",severity:"danger"},accept:()=>{n.post("/delete/news",{nid:o}).then(()=>{y(),window.notyf.success("删除成功")})}})},y=()=>{n.get("/news/list",{params:{page:u.value,size:v.value}}).then(g=>{k.value=g.data})};return n.get("/news/count").then(g=>{B.value=g.data.count}).then(()=>{y()}),H([u,v],()=>{y()}),(g,o)=>{const S=Q,x=V,$=K,r=E,j=T,N=R,A=F;return i(),f(P,null,[t(S,{show:c(p),"onUpdate:show":o[0]||(o[0]=e=>C(p)?p.value=e:null),onFinish:y,nid:c(_)},null,8,["show","nid"]),t(x),s("div",en,[o[4]||(o[4]=s("div",{class:"text-3xl font-bold mb-6"},"信息管理",-1)),t($,{label:"创建信息",class:"mb-4",onClick:o[1]||(o[1]=()=>{p.value=!0,_.value=null})}),t(N,{value:c(k),class:"mb-4"},{default:l(()=>[t(r,{field:"nid",header:"编号"}),t(r,{field:"title",header:"标题"},{body:l(({data:e})=>[s("div",tn,h(e.title),1)]),_:1}),t(r,{field:"category",header:"类型"},{body:l(({data:e})=>[s("div",null,h(c(U)[e.category]),1)]),_:1}),t(r,{field:"tag",header:"标签"},{body:l(({data:e})=>[e.tag?(i(),f("div",on,[(i(!0),f(P,null,M(e.tag.split(" "),b=>(i(),f("div",{key:b},[t(j,{value:b,class:"text-nowrap"},null,8,["value"])]))),128))])):z("",!0)]),_:1}),t(r,{field:"last_update",header:"上次更新"},{body:l(({data:e})=>[s("div",null,h(new Date(e.last_update*1e3).toLocaleString()),1)]),_:1}),t(r,{field:"edit",header:"编辑"},{body:l(({data:e})=>[s("div",null,[t($,{label:"编辑",size:"small",class:"whitespace-nowrap",onClick:()=>{_.value=e.nid,p.value=!0}},null,8,["onClick"])])]),_:1}),t(r,{field:"delete",header:"删除"},{body:l(({data:e})=>[s("div",null,[t($,{label:"删除",severity:"danger",size:"small",class:"whitespace-nowrap",onClick:b=>D(b,e.nid)},null,8,["onClick"])])]),_:1})]),_:1},8,["value"]),s("div",sn,[t(A,{page:c(u),"onUpdate:page":o[2]||(o[2]=e=>C(u)?u.value=e:null),rows:c(v),"onUpdate:rows":o[3]||(o[3]=e=>C(v)?v.value=e:null),totalRecords:c(B),rowsPerPageOptions:[10,20,30]},null,8,["page","rows","totalRecords"])])])],64)}}};export{mn as default};
