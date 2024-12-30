export default function Avatar({userId, username}) {
    const colors = ['bg-pink-300', 'bg-purple-300', 'bg-orange-300', 
                    'bg-blue-300', 'bg-fuchsia-200', 'bg-teal-300']

    const userIdBaseTen = parseInt(userId, 16);
    const color = colors[userIdBaseTen % colors.length];
    return (
        <div className = {"w-8 h-8 rounded-full flex items-center text-white "+color}>
            <div className="text-center w-full opacity-70">
                {username[0]}
            </div>
        </div>
    );
}