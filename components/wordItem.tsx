// 登録したワードをリストにする
import styled from "styled-components"
import delIcon from "data-base64:~assets/del-64.svg"

const borderPx: string = "1px"

const borderColor: string = "#838383"


const Wrapper = styled.div`
  vertical-align: middle;
  display: block;
  width: 100%;
`

const favColor: string = `
  background: #f9e42c;
`

const normalColor: string = `
  background: #D9D9D9;
`

const Item = styled.div<{$isFav: boolean}>`
  ${
    props => props.$isFav ? favColor : normalColor
  }
  display: flex;
  border: ${borderPx} ${borderColor} solid;
  width: auto;
  font-size: 30px;
  margin-bottom: 7px;
  font-size: 30px;
`

const CheckboxWrapper = styled.div`
  flex-grow: 1;
  border-right: ${borderPx} ${borderColor} solid;
  text-align: center;
`

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
`

const favScroll: string = `
  scrollbar-color: black #f9e42c;
`

const normalScroll: string = `
  scrollbar-color: black #D9D9D9;
`

// widthを指定しないとoverflow: hidden;が効かない
// anyはbooleanに直す
const WordItemSpace = styled.div<{$isFav?: boolean}>`
  ${
    props => props.$isFav ? favScroll : normalScroll
  }
  width: 0;
  height: 40px;
  overflow-y: scroll;
  scrollbar-width: thin;
  flex-grow: 7;
  font-size: 20px;
  cursor: pointer;
  text-align: center;
  vertical-align: center;
  &:hover {
    box-shadow: inset -5px -5px 10px 0px rgba(255, 255, 255, 0.5), inset 5px 5px 10px 0px rgba(0, 0, 0, 0.3);
    scrollbar-color: black white;
  }
`


const WordItemDelBtn = styled.div`
  & {
    flex-grow: 1;
    border-left: ${borderPx} ${borderColor} solid;
    text-align: center;
  }
  &:hover {
    box-shadow: inset -5px -5px 10px 0px rgba(255, 255, 255, 0.5), inset 5px 5px 10px 0px rgba(0, 0, 0, 0.3);
  }
  &:active {
    box-shadow: inset 0px 12px 25px 5px rgba(0, 0, 0, 0.4);
  }

`

const Image = styled.img`
  width: 20px;
  height: 20px;
`



type Props = {
  itemIndex: number,
  word: string,
  isFav: boolean,
  onChangeFav: (id: number) => void,
  // changeFavId: number,
  onClickCopy: (val: string) => void,
  onClickDel: (id: number, val: string) => void,
  // delId: number
}


// ここだけsidepanelに移動してみる
export const WordItem = (props: Props) => {
  return (
    <Wrapper>
      <Item $isFav={props.isFav} >
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            checked={props.isFav}
            // onChange={() => props.onChangeFav(props.changeFavId)}
            onChange={() => props.onChangeFav(props.itemIndex)}
          />
        </CheckboxWrapper>
        <WordItemSpace $isFav={props.isFav} onClick={() => props.onClickCopy(props.word)}>
          {props.word}
        </WordItemSpace>
        <WordItemDelBtn onClick={
          // () => props.onClickDel(props.delId, props.word)
          () => props.onClickDel(props.itemIndex, props.word)
        }>
          <Image src={delIcon} />
        </WordItemDelBtn>
      </Item>
    </Wrapper>
  )
}