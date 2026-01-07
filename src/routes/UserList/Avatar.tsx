import "../../css/avatar.css";
type avatarProps = {
    name: string;
}
export default function Avatar({name}: avatarProps) {
    return (
        <div className="avatar">
            {name.charAt(0)}
        </div>
    );
}