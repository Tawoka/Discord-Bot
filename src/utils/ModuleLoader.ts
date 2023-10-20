export class ModuleLoader {

    private static BASE_PATH = "./../";

    public static getModule(name: string){
        if (name == "userActivityTracking"){
            return import("./../features/usertracking/UserActivityTracking");
        } else {
            return null;
        }
    }


}