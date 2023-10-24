export interface Specification {

    isSatisfiedBy(args: any): boolean,

    get name(): string

}