const Svg = ({ className, solid, children }) => (
    <svg
        className={className}
        fill={solid ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
    >
        {children}
    </svg>
);

const P = ({ d }) => <path strokeLinecap="round" strokeLinejoin="round" d={d} />;

export const IconHeart = ({ solid, className }) => (
    <Svg solid={solid} className={className}>
        <P d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </Svg>
);

export const IconChevronLeft = ({ className }) => (
    <Svg className={className}><P d="M15 19l-7-7 7-7" /></Svg>
);

export const IconChevronRight = ({ className }) => (
    <Svg className={className}><P d="M9 5l7 7-7 7" /></Svg>
);

export const IconMap = ({ className }) => (
    <Svg className={className}>
        <P d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </Svg>
);

export const IconMusic = ({ className }) => (
    <Svg className={className}>
        <P d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </Svg>
);

export const IconLock = ({ className }) => (
    <Svg className={className}>
        <P d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002-2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </Svg>
);

export const IconMenu = ({ className }) => (
    <Svg className={className}><P d="M4 6h16M4 12h16M4 18h16" /></Svg>
);

export const IconX = ({ className }) => (
    <Svg className={className}><P d="M6 18L18 6M6 6l12 12" /></Svg>
);

export const IconSearch = ({ className }) => (
    <Svg className={className}>
        <P d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </Svg>
);
