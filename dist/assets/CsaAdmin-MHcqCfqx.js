import{B as R,E as T,cj as V,A as l,R as H,bz as B,o,d as u,e as f,cf as N,c as v,l as U,D as M,k as c,t as z,U as S,Z as I,ck as y,q as g,u as A,H as _,K as Z,J as L,L as j,M as W,O as q,P as J,r as x,w as E,g as w,T as G,C as O,F as b,f as P,j as Q,a as X,$ as Y}from"./index-CQFalJij.js";var $=function(e){var t=e.dt;return`
.p-menu {
    background: `.concat(t("menu.background"),`;
    color: `).concat(t("menu.color"),`;
    border: 1px solid `).concat(t("menu.border.color"),`;
    border-radius: `).concat(t("menu.border.radius"),`;
    min-width: 12.5rem;
}

.p-menu-list {
    margin: 0;
    padding: `).concat(t("menu.list.padding"),`;
    outline: 0 none;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: `).concat(t("menu.list.gap"),`;
}

.p-menu-item-content {
    transition: background `).concat(t("menu.transition.duration"),", color ").concat(t("menu.transition.duration"),`;
    border-radius: `).concat(t("menu.item.border.radius"),`;
    color: `).concat(t("menu.item.color"),`;
}

.p-menu-item-link {
    cursor: pointer;
    display: flex;
    align-items: center;
    text-decoration: none;
    overflow: hidden;
    position: relative;
    color: inherit;
    padding: `).concat(t("menu.item.padding"),`;
    gap: `).concat(t("menu.item.gap"),`;
    user-select: none;
    outline: 0 none;
}

.p-menu-item-label {
    line-height: 1;
}

.p-menu-item-icon {
    color: `).concat(t("menu.item.icon.color"),`;
}

.p-menu-item.p-focus .p-menu-item-content {
    color: `).concat(t("menu.item.focus.color"),`;
    background: `).concat(t("menu.item.focus.background"),`;
}

.p-menu-item.p-focus .p-menu-item-icon {
    color: `).concat(t("menu.item.icon.focus.color"),`;
}

.p-menu-item:not(.p-disabled) .p-menu-item-content:hover {
    color: `).concat(t("menu.item.focus.color"),`;
    background: `).concat(t("menu.item.focus.background"),`;
}

.p-menu-item:not(.p-disabled) .p-menu-item-content:hover .p-menu-item-icon {
    color: `).concat(t("menu.item.icon.focus.color"),`;
}

.p-menu-overlay {
    box-shadow: `).concat(t("menu.shadow"),`;
}

.p-menu-submenu-label {
    background: `).concat(t("menu.submenu.label.background"),`;
    padding: `).concat(t("menu.submenu.label.padding"),`;
    color: `).concat(t("menu.submenu.label.color"),`;
    font-weight: `).concat(t("menu.submenu.label.font.weight"),`;
}

.p-menu-separator {
    border-top: 1px solid `).concat(t("menu.separator.border.color"),`;
}
`)},ee={root:function(e){var t=e.props;return["p-menu p-component",{"p-menu-overlay":t.popup}]},start:"p-menu-start",list:"p-menu-list",submenuLabel:"p-menu-submenu-label",separator:"p-menu-separator",end:"p-menu-end",item:function(e){var t=e.instance;return["p-menu-item",{"p-focus":t.id===t.focusedOptionId,"p-disabled":t.disabled()}]},itemContent:"p-menu-item-content",itemLink:"p-menu-item-link",itemIcon:"p-menu-item-icon",itemLabel:"p-menu-item-label"},ne=R.extend({name:"menu",theme:$,classes:ee}),te={name:"BaseMenu",extends:T,props:{popup:{type:Boolean,default:!1},model:{type:Array,default:null},appendTo:{type:[String,Object],default:"body"},autoZIndex:{type:Boolean,default:!0},baseZIndex:{type:Number,default:0},tabindex:{type:Number,default:0},ariaLabel:{type:String,default:null},ariaLabelledby:{type:String,default:null}},style:ne,provide:function(){return{$pcMenu:this,$parentInstance:this}}},D={name:"Menuitem",hostName:"Menu",extends:T,inheritAttrs:!1,emits:["item-click","item-mousemove"],props:{item:null,templates:null,id:null,focusedOptionId:null,index:null},methods:{getItemProp:function(e,t){return e&&e.item?V(e.item[t]):void 0},getPTOptions:function(e){return this.ptm(e,{context:{item:this.item,index:this.index,focused:this.isItemFocused(),disabled:this.disabled()}})},isItemFocused:function(){return this.focusedOptionId===this.id},onItemClick:function(e){var t=this.getItemProp(this.item,"command");t&&t({originalEvent:e,item:this.item.item}),this.$emit("item-click",{originalEvent:e,item:this.item,id:this.id})},onItemMouseMove:function(e){this.$emit("item-mousemove",{originalEvent:e,item:this.item,id:this.id})},visible:function(){return typeof this.item.visible=="function"?this.item.visible():this.item.visible!==!1},disabled:function(){return typeof this.item.disabled=="function"?this.item.disabled():this.item.disabled},label:function(){return typeof this.item.label=="function"?this.item.label():this.item.label},getMenuItemProps:function(e){return{action:l({class:this.cx("itemLink"),tabindex:"-1","aria-hidden":!0},this.getPTOptions("itemLink")),icon:l({class:[this.cx("itemIcon"),e.icon]},this.getPTOptions("itemIcon")),label:l({class:this.cx("itemLabel")},this.getPTOptions("itemLabel"))}}},directives:{ripple:H}},ie=["id","aria-label","aria-disabled","data-p-focused","data-p-disabled"],se=["href","target"];function oe(n,e,t,s,a,i){var p=B("ripple");return i.visible()?(o(),u("li",l({key:0,id:t.id,class:[n.cx("item"),t.item.class],role:"menuitem",style:t.item.style,"aria-label":i.label(),"aria-disabled":i.disabled()},i.getPTOptions("item"),{"data-p-focused":i.isItemFocused(),"data-p-disabled":i.disabled()||!1}),[f("div",l({class:n.cx("itemContent"),onClick:e[0]||(e[0]=function(h){return i.onItemClick(h)}),onMousemove:e[1]||(e[1]=function(h){return i.onItemMouseMove(h)})},i.getPTOptions("itemContent")),[t.templates.item?t.templates.item?(o(),v(M(t.templates.item),{key:1,item:t.item,label:i.label(),props:i.getMenuItemProps(t.item)},null,8,["item","label","props"])):c("",!0):N((o(),u("a",l({key:0,href:t.item.url,class:n.cx("itemLink"),target:t.item.target,tabindex:"-1"},i.getPTOptions("itemLink")),[t.templates.itemicon?(o(),v(M(t.templates.itemicon),{key:0,item:t.item,class:U(n.cx("itemIcon"))},null,8,["item","class"])):t.item.icon?(o(),u("span",l({key:1,class:[n.cx("itemIcon"),t.item.icon]},i.getPTOptions("itemIcon")),null,16)):c("",!0),f("span",l({class:n.cx("itemLabel")},i.getPTOptions("itemLabel")),z(i.label()),17)],16,se)),[[p]])],16)],16,ie)):c("",!0)}D.render=oe;function K(n){return ue(n)||le(n)||re(n)||ae()}function ae(){throw new TypeError(`Invalid attempt to spread non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function re(n,e){if(n){if(typeof n=="string")return C(n,e);var t={}.toString.call(n).slice(8,-1);return t==="Object"&&n.constructor&&(t=n.constructor.name),t==="Map"||t==="Set"?Array.from(n):t==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?C(n,e):void 0}}function le(n){if(typeof Symbol<"u"&&n[Symbol.iterator]!=null||n["@@iterator"]!=null)return Array.from(n)}function ue(n){if(Array.isArray(n))return C(n)}function C(n,e){(e==null||e>n.length)&&(e=n.length);for(var t=0,s=Array(e);t<e;t++)s[t]=n[t];return s}var F={name:"Menu",extends:te,inheritAttrs:!1,emits:["show","hide","focus","blur"],data:function(){return{id:this.$attrs.id,overlayVisible:!1,focused:!1,focusedOptionIndex:-1,selectedOptionIndex:-1}},watch:{"$attrs.id":function(e){this.id=e||S()}},target:null,outsideClickListener:null,scrollHandler:null,resizeListener:null,container:null,list:null,mounted:function(){this.id=this.id||S(),this.popup||(this.bindResizeListener(),this.bindOutsideClickListener())},beforeUnmount:function(){this.unbindResizeListener(),this.unbindOutsideClickListener(),this.scrollHandler&&(this.scrollHandler.destroy(),this.scrollHandler=null),this.target=null,this.container&&this.autoZIndex&&I.clear(this.container),this.container=null},methods:{itemClick:function(e){var t=e.item;this.disabled(t)||(t.command&&t.command(e),this.overlayVisible&&this.hide(),!this.popup&&this.focusedOptionIndex!==e.id&&(this.focusedOptionIndex=e.id))},itemMouseMove:function(e){this.focused&&(this.focusedOptionIndex=e.id)},onListFocus:function(e){this.focused=!0,!this.popup&&this.changeFocusedOptionIndex(0),this.$emit("focus",e)},onListBlur:function(e){this.focused=!1,this.focusedOptionIndex=-1,this.$emit("blur",e)},onListKeyDown:function(e){switch(e.code){case"ArrowDown":this.onArrowDownKey(e);break;case"ArrowUp":this.onArrowUpKey(e);break;case"Home":this.onHomeKey(e);break;case"End":this.onEndKey(e);break;case"Enter":case"NumpadEnter":this.onEnterKey(e);break;case"Space":this.onSpaceKey(e);break;case"Escape":this.popup&&(y(this.target),this.hide());case"Tab":this.overlayVisible&&this.hide();break}},onArrowDownKey:function(e){var t=this.findNextOptionIndex(this.focusedOptionIndex);this.changeFocusedOptionIndex(t),e.preventDefault()},onArrowUpKey:function(e){if(e.altKey&&this.popup)y(this.target),this.hide(),e.preventDefault();else{var t=this.findPrevOptionIndex(this.focusedOptionIndex);this.changeFocusedOptionIndex(t),e.preventDefault()}},onHomeKey:function(e){this.changeFocusedOptionIndex(0),e.preventDefault()},onEndKey:function(e){this.changeFocusedOptionIndex(g(this.container,'li[data-pc-section="item"][data-p-disabled="false"]').length-1),e.preventDefault()},onEnterKey:function(e){var t=A(this.list,'li[id="'.concat("".concat(this.focusedOptionIndex),'"]')),s=t&&A(t,'a[data-pc-section="itemlink"]');this.popup&&y(this.target),s?s.click():t&&t.click(),e.preventDefault()},onSpaceKey:function(e){this.onEnterKey(e)},findNextOptionIndex:function(e){var t=g(this.container,'li[data-pc-section="item"][data-p-disabled="false"]'),s=K(t).findIndex(function(a){return a.id===e});return s>-1?s+1:0},findPrevOptionIndex:function(e){var t=g(this.container,'li[data-pc-section="item"][data-p-disabled="false"]'),s=K(t).findIndex(function(a){return a.id===e});return s>-1?s-1:0},changeFocusedOptionIndex:function(e){var t=g(this.container,'li[data-pc-section="item"][data-p-disabled="false"]'),s=e>=t.length?t.length-1:e<0?0:e;s>-1&&(this.focusedOptionIndex=t[s].getAttribute("id"))},toggle:function(e){this.overlayVisible?this.hide():this.show(e)},show:function(e){this.overlayVisible=!0,this.target=e.currentTarget},hide:function(){this.overlayVisible=!1,this.target=null},onEnter:function(e){_(e,{position:"absolute",top:"0",left:"0"}),this.alignOverlay(),this.bindOutsideClickListener(),this.bindResizeListener(),this.bindScrollListener(),this.autoZIndex&&I.set("menu",e,this.baseZIndex+this.$primevue.config.zIndex.menu),this.popup&&y(this.list),this.$emit("show")},onLeave:function(){this.unbindOutsideClickListener(),this.unbindResizeListener(),this.unbindScrollListener(),this.$emit("hide")},onAfterLeave:function(e){this.autoZIndex&&I.clear(e)},alignOverlay:function(){Z(this.container,this.target);var e=L(this.target);e>L(this.container)&&(this.container.style.minWidth=L(this.target)+"px")},bindOutsideClickListener:function(){var e=this;this.outsideClickListener||(this.outsideClickListener=function(t){var s=e.container&&!e.container.contains(t.target),a=!(e.target&&(e.target===t.target||e.target.contains(t.target)));e.overlayVisible&&s&&a?e.hide():!e.popup&&s&&a&&(e.focusedOptionIndex=-1)},document.addEventListener("click",this.outsideClickListener))},unbindOutsideClickListener:function(){this.outsideClickListener&&(document.removeEventListener("click",this.outsideClickListener),this.outsideClickListener=null)},bindScrollListener:function(){var e=this;this.scrollHandler||(this.scrollHandler=new j(this.target,function(){e.overlayVisible&&e.hide()})),this.scrollHandler.bindScrollListener()},unbindScrollListener:function(){this.scrollHandler&&this.scrollHandler.unbindScrollListener()},bindResizeListener:function(){var e=this;this.resizeListener||(this.resizeListener=function(){e.overlayVisible&&!W()&&e.hide()},window.addEventListener("resize",this.resizeListener))},unbindResizeListener:function(){this.resizeListener&&(window.removeEventListener("resize",this.resizeListener),this.resizeListener=null)},visible:function(e){return typeof e.visible=="function"?e.visible():e.visible!==!1},disabled:function(e){return typeof e.disabled=="function"?e.disabled():e.disabled},label:function(e){return typeof e.label=="function"?e.label():e.label},onOverlayClick:function(e){q.emit("overlay-click",{originalEvent:e,target:this.target})},containerRef:function(e){this.container=e},listRef:function(e){this.list=e}},computed:{focusedOptionId:function(){return this.focusedOptionIndex!==-1?this.focusedOptionIndex:null}},components:{PVMenuitem:D,Portal:J}},de=["id"],ce=["id","tabindex","aria-activedescendant","aria-label","aria-labelledby"],me=["id"];function pe(n,e,t,s,a,i){var p=x("PVMenuitem"),h=x("Portal");return o(),v(h,{appendTo:n.appendTo,disabled:!n.popup},{default:E(function(){return[w(G,l({name:"p-connected-overlay",onEnter:i.onEnter,onLeave:i.onLeave,onAfterLeave:i.onAfterLeave},n.ptm("transition")),{default:E(function(){return[!n.popup||a.overlayVisible?(o(),u("div",l({key:0,ref:i.containerRef,id:a.id,class:n.cx("root"),onClick:e[3]||(e[3]=function(){return i.onOverlayClick&&i.onOverlayClick.apply(i,arguments)})},n.ptmi("root")),[n.$slots.start?(o(),u("div",l({key:0,class:n.cx("start")},n.ptm("start")),[O(n.$slots,"start")],16)):c("",!0),f("ul",l({ref:i.listRef,id:a.id+"_list",class:n.cx("list"),role:"menu",tabindex:n.tabindex,"aria-activedescendant":a.focused?i.focusedOptionId:void 0,"aria-label":n.ariaLabel,"aria-labelledby":n.ariaLabelledby,onFocus:e[0]||(e[0]=function(){return i.onListFocus&&i.onListFocus.apply(i,arguments)}),onBlur:e[1]||(e[1]=function(){return i.onListBlur&&i.onListBlur.apply(i,arguments)}),onKeydown:e[2]||(e[2]=function(){return i.onListKeyDown&&i.onListKeyDown.apply(i,arguments)})},n.ptm("list")),[(o(!0),u(b,null,P(n.model,function(r,d){return o(),u(b,{key:i.label(r)+d.toString()},[r.items&&i.visible(r)&&!r.separator?(o(),u(b,{key:0},[r.items?(o(),u("li",l({key:0,id:a.id+"_"+d,class:[n.cx("submenuLabel"),r.class],role:"none",ref_for:!0},n.ptm("submenuLabel")),[O(n.$slots,n.$slots.submenulabel?"submenulabel":"submenuheader",{item:r},function(){return[Q(z(i.label(r)),1)]})],16,me)):c("",!0),(o(!0),u(b,null,P(r.items,function(m,k){return o(),u(b,{key:m.label+d+"_"+k},[i.visible(m)&&!m.separator?(o(),v(p,{key:0,id:a.id+"_"+d+"_"+k,item:m,templates:n.$slots,focusedOptionId:i.focusedOptionId,unstyled:n.unstyled,onItemClick:i.itemClick,onItemMousemove:i.itemMouseMove,pt:n.pt},null,8,["id","item","templates","focusedOptionId","unstyled","onItemClick","onItemMousemove","pt"])):i.visible(m)&&m.separator?(o(),u("li",l({key:"separator"+d+k,class:[n.cx("separator"),r.class],style:m.style,role:"separator",ref_for:!0},n.ptm("separator")),null,16)):c("",!0)],64)}),128))],64)):i.visible(r)&&r.separator?(o(),u("li",l({key:"separator"+d.toString(),class:[n.cx("separator"),r.class],style:r.style,role:"separator",ref_for:!0},n.ptm("separator")),null,16)):(o(),v(p,{key:i.label(r)+d.toString(),id:a.id+"_"+d,item:r,index:d,templates:n.$slots,focusedOptionId:i.focusedOptionId,unstyled:n.unstyled,onItemClick:i.itemClick,onItemMousemove:i.itemMouseMove,pt:n.pt},null,8,["id","item","index","templates","focusedOptionId","unstyled","onItemClick","onItemMousemove","pt"]))],64)}),128))],16,ce),n.$slots.end?(o(),u("div",l({key:1,class:n.cx("end")},n.ptm("end")),[O(n.$slots,"end")],16)):c("",!0)],16,de)):c("",!0)]}),_:3},16,["onEnter","onLeave","onAfterLeave"])]}),_:3},8,["appendTo","disabled"])}F.render=pe;const fe={class:"flex"},he={class:"grow-0"},be={class:"card flex justify-center m-4 lg:m-8"},ve={class:"grow min-w-0 my-16"},ge={__name:"CsaAdmin",setup(n){const e=Y(),t=X([{label:"数据管理",items:[{label:"新闻管理",icon:"pi pi-file-edit",command:()=>{e.push({name:"admin-news"})}},{label:"活动管理",icon:"pi pi-calendar",command:()=>{e.push({name:"admin-event"})}}]},{label:"用户管理",items:[{label:"用户管理",icon:"pi pi-user",command:()=>{e.push({name:"admin-users"})}},{label:"纳新管理",icon:"pi pi-user",command:()=>{e.push({name:"admin-recruit"})}},{label:"面试管理",icon:"pi pi-comments",command:()=>{e.push({name:"admin-interview"})}},{label:"干事管理",icon:"pi pi-users",command:()=>{e.push({name:"admin-member"})}}]}]);return(s,a)=>{const i=F,p=x("router-view");return o(),u("div",fe,[f("div",he,[f("div",be,[w(i,{model:t.value},null,8,["model"])])]),f("div",ve,[w(p)])])}}};export{ge as default};
