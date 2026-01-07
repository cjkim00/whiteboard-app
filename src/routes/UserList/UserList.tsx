type userListProps = {
    name: string;
}
export default function UserList({name}: userListProps) {
    return (
        <div className="user-list">
            <p>{name.charAt(0)}</p>
        </div>
    );
}