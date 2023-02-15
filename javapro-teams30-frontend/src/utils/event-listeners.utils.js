export function closeCustomContextMenus() {
  if (window.customContextMenuOpened) {
    const contextMenus = document.getElementsByClassName("im-chat__message__menu _visible");
    [...contextMenus].forEach((menu) => menu.classList.remove("_visible"));
    window.customContextMenuOpened = false;
  }
}
