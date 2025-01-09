import PossibleQuestionResponse from "./possibleQuestionResponse";

export default interface Question {
    content: string;
    questionTypeId: string;
    responses?: PossibleQuestionResponse[]
}