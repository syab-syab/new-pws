import { useState } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import type { Word } from "~models/Word"
import { storageWordKey } from "~variables/storageWordKey"
import { Header } from "~components/header"
import { AddWordForm } from "~components/addWordForm"
import { WordItem } from "~components/wordItem"
// import { updateContextMenus } from "~background"


function IndexSidePanel() {

  // popup,sidepanel共通
  const words: Array<Word | any> = []

  // popup, sidepanel共通
  // useStorageの第二引数は初期値で、すでにstorageに値がある場合は無視されるっぽい
  const [wordArr, setWordArr] = useStorage<string>(storageWordKey, JSON.stringify(words))
  const [tmpData, setTmpData] = useState<string>("")
  const [propFav, setPropFav] = useState<string>("normal")

  // popup, sidepanel共通
  // ワード追加
  const addWordArr = (val: string) => {
    // 配列をコピーしてから
    const tmpArr: Array<Word | any> = JSON.parse(wordArr).slice()
    // 型を整形する
    const tmpWord: Word = {
      id: Date.now(),
      word: val,
      fav: propFav === "fav" ? true : false
    }
    // 値を格納
    tmpArr.push(tmpWord)
    setWordArr(JSON.stringify(tmpArr))
    setTmpData("")
    // sidepanelとoptionsは状態の初期化とアラートは不要
  }

  // ワード削除
  const delWord = (id: number, val: string) => {
    if (confirm(`「${val}」を削除しますか？`)) {
      // 配列をコピーしてから
      const tmpArr: Array<Word | any> = JSON.parse(wordArr).slice()
      // 取得したid以外の要素で新しい配列をfilterで作る
      const newArr: Array<Word | any> = tmpArr.filter(a => a.id !== id)
      // ストレージに格納
      setWordArr(JSON.stringify(newArr))
      alert(`「${val}」を削除しました。`)
    }
  }

  // お気に入り編集
  const toggleFav = (id: number) => {
    // 配列をコピーしてから
    const tmpArr: Array<Word | any> = JSON.parse(wordArr).slice()
    // 渡されたidの要素を編集する
    tmpArr.map((v: Word) => {
      if (v.id === id) {
        v.fav = !v.fav
      }
    })
    setWordArr(JSON.stringify(tmpArr))
  }

  // コピー関数
  const copyWord = (val: string) => {
    navigator.clipboard.writeText(val)
    alert(`「${val}」をコピーしました。`)
  }

  // const localWordData: Array<Word | any> = JSON.parse(wordArr)
  return (
    <>
      <Header />
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
        <p
          style={{
            margin: "10px",
            fontSize: "20px",
            textAlign: "center"
          }}
        >
          {/* 現在保管中のワード: {localWordData.length} */}
        </p>
        {
          // WordItemをmapで並べるとbuild時にエラーが出るっぽい
          JSON.parse(wordArr)?.map((a: Word | any) => {
            return (
              // 基本一列にする
              <WordItem
                key={a.id}
                itemIndex={a.id}
                word={a.word}
                isFav={a.fav}
                onChangeFav={toggleFav}
                // changeFavId={a.id}
                onClickCopy={copyWord}
                onClickDel={delWord}
                // delId={a.id}
              />
            )
          })
        }
      </div>
    </>
  )
}

export default IndexSidePanel