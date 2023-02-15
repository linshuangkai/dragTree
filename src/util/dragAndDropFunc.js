export function getElPosition(ele) {
  let t = ele.offsetTop
  let l = ele.offsetLeft
  ele = ele.offsetParent
  while (ele != null) {
    t += ele.offsetTop
    l += ele.offsetLeft
    ele = ele.offsetParent
  }
  return {
    top: t,
    left: l
  }
}
