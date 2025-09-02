using Microsoft.AspNetCore.SignalR;

namespace UniStock.Hubs;

public class CommentsHub : Hub
{
    public async Task JoinGroup(string inventoryId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, inventoryId);
    }
}