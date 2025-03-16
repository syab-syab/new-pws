import { useState } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import type { Word } from "~models/Word"
import { storageWordKey } from "~variables/storageWordKey"
import { Header } from "~components/header"
import { AddWordForm } from "~components/addWordForm"
import { 
  Wrapper,
  Item,
  CheckboxWrapper,
  Checkbox,
  WordItemSpace,
  WordItemDelBtn,
  Image
} from "~components/wordItem"
import delIcon from "data-base64:~assets/del-64.png"

function IndexSidePanel() {
  // ↓修正点
  const words: Word[] = []; // 型を明確化

  const [wordArr, setWordArr] = useStorage<string>(storageWordKey, JSON.stringify(words))
  const [tmpData, setTmpData] = useState<string>("")
  const [propFav, setPropFav] = useState<string>("normal")

  // 新しい関数
  // parsedWordsを即時関数で定義し、JSON.parseのエラー処理を追加。
  const parsedWords: Word[] = (() => {
    try {
      return JSON.parse(wordArr || "[]") as Word[];
    } catch (e) {
      console.error("wordArrのパースに失敗:", e);
      return [];
    }
  })();

  // バックグラウンドへのメッセージング
  const handleUpdateMenus = () => {
    chrome.runtime.sendMessage(
      { action: "updateContextMenus" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("エラー:", chrome.runtime.lastError);
        } else {
          console.log("コンテキストメニューが更新されました:", response);
        }
      }
    )
  }

  const addWordArr = (val: string) => {
    // const tmpArr: Array<Word | any> = JSON.parse(wordArr).slice()
    const tmpArr = parsedWords.slice();
    const tmpWord: Word = {
      id: Date.now(),
      word: val,
      // fav: propFav === "fav" ? true : false
      fav: propFav === "fav"
    }
    tmpArr.push(tmpWord)
    setWordArr(JSON.stringify(tmpArr))
    handleUpdateMenus()
    setTmpData("")
  }

  const delWord = (id: number, val: string) => {
    if (confirm(`「${val}」を削除しますか？`)) {
      // const tmpArr: Array<Word | any> = JSON.parse(wordArr).slice()
      // const newArr: Array<Word | any> = tmpArr.filter(a => a.id !== id)
      const newArr = parsedWords.filter(a => a.id !== id);
      setWordArr(JSON.stringify(newArr))
      handleUpdateMenus()
      alert(`「${val}」を削除しました。`)
    }
  }



  const toggleFav = (id: number) => {
    // const tmpArr: Array<Word | any> = JSON.parse(wordArr).slice()
    const tmpArr = parsedWords.slice();
    // tmpArr.map((v: Word) => {
    //   if (v.id === id) {
    //     v.fav = !v.fav
    //   }
    // })
    tmpArr.forEach((v: Word) => {
      if (v.id === id) v.fav = !v.fav;
    });
    setWordArr(JSON.stringify(tmpArr))
    handleUpdateMenus()
  }

  const copyWord = (val: string) => {
    navigator.clipboard.writeText(val)
    alert(`「${val}」をコピーしました。`)
  }

  // const limitedWords = parsedWords.slice(0, 100);

  return (
    <>
      <Header />
      {/* [TODO] */}
      {/* サイドパネルは登録したワードの管理だけで新規登録する必要はないかも */}
      <AddWordForm
        onChangeTextArea={setTmpData}
        textAreaValue={tmpData}
        onChangeSelect={setPropFav}
        onClickSubscribeBtn={addWordArr}
        subscribeValue={tmpData}
      />

      <div
        style={{marginTop: "10px"}}
      >
        {
          // mapをparsedWordsに対して実行し、不正なデータでクラッシュしないように。
          parsedWords.map((w: Word) => {
          // limitedWords.map((w: Word) => {
            return (
                <Wrapper key={w.id}>
                  <Item $isFav={w.fav} >
                    <CheckboxWrapper>
                      <Checkbox
                        type="checkbox"
                        checked={w.fav}
                        onChange={() => toggleFav(w.id)}
                      />
                    </CheckboxWrapper>
                    <WordItemSpace $isFav={w.fav} onClick={() => copyWord(w.word)}>
                      {w.word}
                    </WordItemSpace>
                    <WordItemDelBtn onClick={
                      () => delWord(w.id, w.word)
                    }>
                      <Image src={delIcon} />
                      {/* del */}
                    </WordItemDelBtn>
                  </Item>
                </Wrapper>
            )
          })
        }
      </div>
    </>
  )
}

export default IndexSidePanel