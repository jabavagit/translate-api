export type ILiteral = {
    id: number;
    name: string;
    langs: ILang | any;
    infoLangs?: string;
    isNew?: boolean;
};

export type ILang = {
    CA?: string | any;
    DE?: string | any;
    EN?: string | any;
    ES?: string | any;
    FR?: string | any;
    IT?: string | any;
    JA?: string | any;
    NL?: string | any;
    PT?: string | any;
    RU?: string | any;
    ZH?: string | any;
};

export type IProject = {
    id?: number | undefined;
    name?: string;
    literals?: ILiteral[] | any[];
    path?: ILang[] | any[];
    filters?: IFiltersCount
};

export type IProjects = {
    projects: IProject[]
};

export type IMenu = {
    id: number,
    name: string,
    countLiterals: number,
    langs: ILang[]
}

export type IHome = {
    title: string;
    header: IHeader;
    dashboard?: IDashboard;
}

export type IHeader = {
    show: boolean;
    breadcrumb: IBreadcrumb[]
}

export type IBreadcrumb = {
    id: number;
    name: string;
    url: string;
    css: string;
    export: {
        show: boolean;
        css?: string;
    }
}

export type IItemMenu = {
    id: number | undefined;
    name: string | undefined;
    countLiterals?: number | undefined;
}

export type IDashboard = {
    show: {
        project: boolean;
        formLiteral: boolean;
        import: boolean;
        menu: boolean;
        alerts: boolean;
    };
    project?: IProject;
    formLiteral?: IFormLiteral;
    import?: IImportFile[];
    menu: IItemMenu[];
    alerts?: IAlerts;
    url?: IUrl;
}

export type IUrl = {
    importOrigin?: string;
    importExcel?: string;
}

export type IAlerts = {
    strong: string;
    text: string;
    styles: string;
    show?: boolean;
}
export type IImportFile = {
    name: string;
    langs: ILang;
    nameProject?: string;
    arrLangs: Array<string>
}

export type IFormLiteral = {
    isNew: boolean;
    literal: ILiteral;
    langs: Array<string>;
    selectLang: string;
}

export type IItemLiteral = {
    id: number;
    name: string;
    langs: ILang;
}

export type IFilters = {
    all: IItemLiteral[],
    missing: IItemLiteral[],
    untranslated: IItemLiteral[]
}

export type IFiltersType = {
    ALL: string,
    MISSING: string,
    UNTRANSLATED: string
}

export type IFiltersCount = {
    all: {
        count: number,
        active: boolean
    },
    missing: {
        count: number,
        active: boolean
    },
    untranslated: {
        count: number,
        active: boolean
    }
}
