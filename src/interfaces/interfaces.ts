export interface ILiteral {
    id: number;
    name: string;
    langs: ILang | any;
    infoLangs?: string;
    isNew?: boolean;
};

export interface ILang {
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

export interface IProject {
    id?: number | undefined;
    name?: string;
    literals?: ILiteral[] | any[];
    path?: ILang[] | any[];
    filters?: IFiltersCount
};

export interface IProjects {
    projects: IProject[]
};

export interface IMenu {
    id: number,
    name: string,
    countLiterals: number,
    langs: ILang[]
}

export interface IHome {
    title: string;
    header: IHeader;
    dashboard?: IDashboard;
}

export interface IHeader {
    show: boolean;
    breadcrumb: IBreadcrumb[]
}

export interface IBreadcrumb {
    id: number;
    name: string;
    url: string;
    css: string;
    export: {
        show: boolean;
        css?: string;
    }
}

export interface IItemMenu {
    id: number | undefined;
    name: string | undefined;
    countLiterals?: number | undefined;
}

export interface IDashboard {
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
}

export interface IAlerts {
    strong: string;
    text: string;
    styles: string;
    show?:boolean;
}
export interface IImportFile {
    name: string;
    langs: ILang;
    nameProject?: string;
    arrLangs: Array<string>
}

export interface IFormLiteral {
    isNew: boolean;
    literal: ILiteral;
    langs: Array<string>;
    selectLang: string;
}

export interface IItemLiteral {
    id: number;
    name: string;
    langs: ILang;
}

export interface IFilters {
    all: IItemLiteral[],
    missing: IItemLiteral[],
    untranslated: IItemLiteral[]
}

export interface IFiltersType {
    ALL: string,
    MISSING: string,
    UNTRANSLATED: string
}

export interface IFiltersCount {
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
