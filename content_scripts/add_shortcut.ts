
function openInNewTab(url:string, active:boolean) {
    // window.open(url, '_blank')!.focus(); // こっちだと、そのwebのドメインのポップアップを許可する必要がある。
    browser.runtime.sendMessage({ command: 'createtab', url: url, active });
}
  
function myscroll(e:HTMLElement) {
    // a.
    var selection = window.getSelection();
    selection?.removeAllRanges();

    let range = document.createRange();
    range.selectNode(e);
    selection?.addRange(range);

    if (0) {
        let rect = range.getBoundingClientRect();
        console.log(rect);
        // scroll to top if:
        // - some part of selection is above the viewport
        // - some part of selection is below the viewport
        if (rect.top < 0 || rect.bottom > document.documentElement.clientHeight) {
            window.scrollBy(0, rect.y);
        }
        window.scrollTo(0, rect.top);
        
    } else {
        // e.scrollIntoView(true);
        // e.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        e.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
}

function geturl_from_parent(e: HTMLElement) {
    let p = e.parentElement;
    let i = 0;
    while (p?.tagName !== 'A') {
        // console.log('tag:' + p?.tagName);
        p = p!.parentElement;
        i += 1;
        if (i > 20) return null;
    }
    if (p?.tagName === 'A') {
        let url = p.getAttribute('href')
        // console.log("get2:" + url);
        return url;
    }
    return null;
}

function minmax(d: number, minv: number, maxv: number) {
    return Math.max(minv, Math.min(d, maxv));
}

// visibleじゃないものはスキップするようにしてstepする。
function stepVisible(elems: HTMLCollectionOf<HTMLElement>, now: number, step: number, minv: number, maxv: number) {
    let c = now;
    let c0 = now;
    // let limf = step > 0 ? Math.min : Math.max;
    while (1) {
        c = minmax(c + step, minv, maxv);
        if (c == c0) break; // リミットに達したら、stepできなかったので元の数値を返す。
        let visible = elems[c].checkVisibility(); // 可視か確認。
        if (visible)return c; // 可視ならここで抜ける。
        c0 = c;        
    }
    // 可視なものがみつからず、リミットに達したらここに来る。
    // return minmax(now, minv, maxv); // 初期値が-incrnの場合、そのまま-
    return now;
}

const incrn = 2; // 検索結果１つあたり、２つのciteタグが出てくるので。
let current_idx = -incrn;
let current_tgt_url = '';
// define a handler
function doc_keyUp(evt:KeyboardEvent) {
    let go = false;
    // let a = document.getElementsByTagName('li');
    let a = document.getElementsByTagName('cite');
    
    // this would test for whichever key is 40 (down arrow) and the ctrl key at the same time
    // if (evt.ctrlKey && evt.code === 'ArrowDown') {
    if (evt.altKey && evt.code === 'KeyK') {
        if (1) {
            current_idx = stepVisible(a, current_idx, incrn, 0, a.length - incrn);
        } else {
            current_idx += incrn;
            if (current_idx > a.length - incrn) current_idx = a.length - incrn;
        }
        go = current_idx >= 0; // 初期値のマイナスではないことを確認。検索結果が０だったり、全て不可視の場合、マイナスのままになるので。
    } else if (evt.altKey && evt.code === 'KeyI') {
        if (1) {
            current_idx = stepVisible(a, current_idx, -incrn, 0, a.length - incrn);
        } else {
            current_idx -= incrn;
            if (current_idx < 0) current_idx = 0;
        }
        go = current_idx >= 0; // 初期値のマイナスではないことを確認。検索結果が０だったり、全て不可視の場合、マイナスのままになるので。
    } else if (evt.altKey && evt.code === 'Enter') {
        // console.log('jump:' + current_tgt_url);
        let active = evt.shiftKey;
        if(current_tgt_url)openInNewTab(current_tgt_url, active);
    }else if (evt.altKey && evt.code === 'KeyL') {
        // console.log('jump:' + current_tgt_url);
        let active = evt.shiftKey;
        // openInNewTab(current_tgt_url, active);
        // location.replace(current_tgt_url);
        if(current_tgt_url)location.assign(current_tgt_url);
    }

    if (go)
    {
        if (current_idx < 0) current_idx = 0;
        let e = a[current_idx];
        // current_tgt_url = e.textContent || '';
        current_tgt_url = geturl_from_parent(e)||'';
        // console.log('get:' + current_tgt_url);
        myscroll(e);    
    }

}

// document.body.style.border = "5px solid red"; // web画面が赤枠で囲まれるのでスクリプトが読まれたことがわかり便利
document.addEventListener('keyup', doc_keyUp, false);
