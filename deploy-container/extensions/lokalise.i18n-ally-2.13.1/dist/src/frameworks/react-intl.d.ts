import { Framework } from './base';
import { LanguageId } from '~/utils';
declare class ReactFramework extends Framework {
    id: string;
    display: string;
    detection: {
        packageJSON: string[];
    };
    languageIds: LanguageId[];
    usageMatchRegex: string[];
    refactorTemplates(keypath: string): string[];
}
export default ReactFramework;
