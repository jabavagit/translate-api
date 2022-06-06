export interface Literal {
    id: number;
    name: string;
    lang: Lang | any;
};

export interface Lang {
    CA?: any;
    DE?: any;
    EN?: any;
    ES?: any;
    FR?: any;
    IT?: any;
    JA?: any;
    NL?: any;
    PT?: any;
    RU?: any;
    ZH?: any;
};

export interface Project {
    id?: number;
    name?: string;
    literals?: Literal[] | any[];
    path?: Lang | any[];
};

export interface modelProjects {
    projects: Project[]
};

export interface menu {
    id: number,
    name: string,
    countLiterals: number,
    langs: []
}
