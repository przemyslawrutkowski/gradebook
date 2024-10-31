export default interface Message {
    subject: string,
    content: string,
    dateTime: string,
    senderId: string,
    senderTypeId: string,
    receiverId: string,
    receiverTypeId: string
}