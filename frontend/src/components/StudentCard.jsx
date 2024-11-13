import { Fingerprint, Mail, Phone, Trash, User } from "lucide-react";
import Button from "./Button";

const StudentCard = ({name, email, phone, pesel, icon, stClass, onClick}) => {
    return (
        <div className="flex flex-col gap-3">
            <div
                className="flex justify-between items-center border border-textBg-200 hover:cursor-pointer rounded-lg p-3 w-full"
            >
                <div className="flex flex-col gap-2 w-full">
                    <p className="text-base font-semibold text-textBg-700">{name}</p>
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 xl:gap-4 w-full">
                        <div className="flex gap-1 items-center">
                            <Mail color="#F37986" size={16} strokeWidth={1.5} />
                            <p className="text-sm text-textBg-550 col-span-1 overflow-hidden whitespace-nowrap truncate">
                                {email}
                            </p>
                        </div>
                        <div className="flex gap-1 items-center">
                            <Phone color="#F37986" size={16} strokeWidth={1.5}/>
                            <p className="text-sm text-textBg-550 col-span-1">{phone}</p>
                        </div>
                        <div className="flex gap-1 items-center">
                            <Fingerprint color="#F37986" size={16} strokeWidth={1.5}/>
                            <p className="text-sm text-textBg-550 col-span-1">{pesel}</p>
                        </div>
                    </div>
                </div>
                {icon && (
                <div className="flex items-center text-sm text-textBg-700">
                    <Button type="link" size="s" icon={icon} onClick={onClick} />
                </div>
                )}

                {stClass && (
                <div className="flex items-center text-sm text-textBg-700">
                     <p className="text-textBg-700 font-semibold">{stClass}</p>
                </div>
                )}
                
            </div>
        </div>
    );
}

export default StudentCard;

