import BCore from "./BCore";

var _ = BCore._;

export function MdArrawLeftBold() {
    return _(
    `<svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M20,9V15H12V19.84L4.16,12L12,4.16V9H20Z" />
    </svg>`
    );
}

BCore.install('md-arraw-left-bold', MdArrawLeftBold);


export function MdArrawRighttBold() {
    return _(
    `<svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z" />
    </svg>`
    );
}

BCore.install('md-arraw-right-bold', MdArrawRighttBold);

