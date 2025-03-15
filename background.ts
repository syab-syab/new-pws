import type { Word } from "~models/Word"
import { storageWordKey } from "~variables/storageWordKey"
import { Storage } from "@plasmohq/storage"
import type { Tab } from "@plasmohq/chrome"


const storage = new Storage({
  area: "sync"
});


async function loadData(): Promise<Word[]> {
  const value: string = await storage.get(storageWordKey);
  return value ? JSON.parse(value) : [];
}

async function saveData(newWord: Word) {
  const words = await loadData();
  const updatedWords = [...words, newWord];
  await storage.set(storageWordKey, JSON.stringify(updatedWords));
  console.log("データが保存されました");
  updateContextMenus(updatedWords); // 保存後にメニューを更新
}

// 新たな関数
// コンテキストメニューを更新する関数
export function updateContextMenus(words: Word[]) {
  // 既存の動的メニューをクリア
  chrome.contextMenus.removeAll(() => {
    // 固定メニューを再作成
    chrome.contextMenus.create({
      id: "save-word",
      title: "ドラッグしたワードを追加",
      contexts: ["selection"]
    });
    chrome.contextMenus.create({
      id: "save-fav-word",
      parentId: "save-word",
      title: "お気に入りに追加",
      contexts: ["selection"]
    });
    chrome.contextMenus.create({
      id: "save-normal-word",
      parentId: "save-word",
      title: "普通に追加",
      contexts: ["selection"]
    });
    chrome.contextMenus.create({
      id: "paste",
      title: "ワード貼り付け",
      contexts: ["editable"]
    });
    chrome.contextMenus.create({
      id: "fav-paste",
      parentId: "paste",
      title: "お気に入りを貼り付け",
      contexts: ["editable"]
    });
    chrome.contextMenus.create({
      id: "normal-paste",
      parentId: "paste",
      title: "普通の貼り付け",
      contexts: ["editable"]
    });

    // 動的メニューを再生成
    words.forEach((d: Word) => {
      if (d.fav) {
        chrome.contextMenus.create({
          id: `fav-paste-${d.id}`,
          parentId: "fav-paste",
          title: `${d.word}`,
          contexts: ["editable"]
        });
      } else {
        chrome.contextMenus.create({
          id: `normal-paste-${d.id}`,
          parentId: "normal-paste",
          title: `${d.word}`,
          contexts: ["editable"]
        });
      }
    });
  });
}


// 新たなコード
// 初期化
chrome.runtime.onInstalled.addListener(() => {
  loadData().then(updateContextMenus);
});


// ポップアップやサイドパネルからのメッセージを受信
// 後でplasmo風に修正する
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateContextMenus") {
    loadData().then((words) => {
      updateContextMenus(words);
      sendResponse({ status: "success" });
    });
    return true; // 非同期応答のためにtrueを返す
  }
});


const regexFav = /fav-paste-[0-9]+/g
const regexNormal = /normal-paste-[0-9]+/g

chrome.contextMenus.onClicked.addListener((info, tab: Tab | undefined) => {
  if (info.menuItemId === "save-fav-word") {
    const newWord: Word = {
      id: Date.now(),
      // ↓修正点
      word: info.selectionText || "",
      fav: true
    }
    saveData(newWord)
  } else if(info.menuItemId === "save-normal-word") {
    const newWord: Word = {
      id: Date.now(),
      // ↓修正点
      word: info.selectionText || "",
      fav: false
    }
    saveData(newWord)
  } else if (String(info.menuItemId).match(regexFav) && tab?.id) {
    const wordId: number = Number(String(info.menuItemId).substring(10))
    //********************↓修正点
    loadData().then((val: Word[]) => {
      // const tmpArr: Array<Word | any> = val
      // const pasteWord: Word | any = tmpArr.find(v => v.id == wordId)
      const pasteWord = val.find(v => v.id === wordId);
      // ↓修正点
      if (pasteWord) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: modifyInputElement,
          args: [pasteWord.word]
        });
      }
    })
  } else if (String(info.menuItemId).match(regexNormal) && tab?.id) {
    const wordId: number = Number(String(info.menuItemId).substring(13))
    // *******************↓修正点
    loadData().then((val: Word[]) => {
      // const tmpArr: Array<Word | any> = val
      // const pasteWord: Word | any = tmpArr.find(v => v.id == wordId)
      const pasteWord = val.find(v => v.id === wordId);
      if (pasteWord) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: modifyInputElement,
          args: [pasteWord.word]
        });
      }
    })
  }
})

function modifyInputElement(newValue: string) {
  const activeElement = document.activeElement
  if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
    (activeElement as HTMLInputElement | HTMLTextAreaElement).value = newValue
    console.log("入力欄が変更されました:", newValue)
  } else {
    console.log("アクティブな入力欄が見つかりませんでした")
  }
}