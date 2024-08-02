using Microsoft.EntityFrameworkCore;
using GestaoClientes.Domain;

namespace GestaoClientes.Persistence
{
    public class ClientContext : DbContext
    {
        public ClientContext (DbContextOptions<ClientContext> options)
            : base(options)
        {
        }

        public DbSet<Client> Clients { get; set; }
    }
}