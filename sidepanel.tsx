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
// svgファイルだとbuild時にエラーが出るのでpng
import delIcon from "data-base64:~assets/del-64.png"

function IndexSidePanel() {
  const words: Word[] = []; // 型を明確化

  const [wordArr, setWordArr] = useStorage<string>(storageWordKey, JSON.stringify(words))
  const [tmpData, setTmpData] = useState<string>("")
  const [propFav, setPropFav] = useState<string>("normal")

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

  // ワードの追加
  const addWordArr = (val: string) => {
    const tmpArr = parsedWords.slice();
    const tmpWord: Word = {
      id: Date.now(),
      word: val,
      fav: propFav === "fav"
    }
    tmpArr.push(tmpWord)
    setWordArr(JSON.stringify(tmpArr))
    handleUpdateMenus()
    setTmpData("")
  }

  // ワードの削除
  const delWord = (id: number, val: string) => {
    if (confirm(`「${val}」を削除しますか？`)) {
      const newArr = parsedWords.filter(a => a.id !== id);
      setWordArr(JSON.stringify(newArr))
      handleUpdateMenus()
      alert(`「${val}」を削除しました。`)
    }
  }


  // ワードのお気に入り管理
  const toggleFav = (id: number) => {
    const tmpArr = parsedWords.slice();
    tmpArr.forEach((v: Word) => {
      if (v.id === id) v.fav = !v.fav;
    });
    setWordArr(JSON.stringify(tmpArr))
    handleUpdateMenus()
  }

  // ワードのコピー
  const copyWord = (val: string) => {
    navigator.clipboard.writeText(val)
    alert(`「${val}」をコピーしました。`)
  }


  return (
    <>
      <Header />
      {/* ポップアップにあるから追加フォームは要らないかも */}
      <AddWordForm
        onChangeTextArea={setTmpData}
        textAreaValue={tmpData}
        onChangeSelect={setPropFav}
        onClickSubscribeBtn={addWordArr}
        subscribeValue={tmpData}
      />
      <p
        style={{
          fontSize: "20px",
          margin: "5px",
          textAlign: "center",
          letterSpacing: "1px"
        }}
      >
        ストック数: {parsedWords.length}
      </p>
      <div
        // style={{marginTop: "10px"}}
      >
        {
          parsedWords.map((w: Word) => {
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