using GestaoClientes.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GestaoClientes.Domain;

namespace GestaoClientes.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientController(ILogger<ClientController> logger, ClientContext context) : ControllerBase
{
    private readonly ILogger<ClientController> _logger = logger;
    private readonly ClientContext _context = context;

    [HttpGet(Name = "GetClients")]
    public async Task<ActionResult<IEnumerable<Client>>> GetClients([FromQuery] int page = 1, [FromQuery] string? search = null)
    {
        try
        {
            var query = _context.Clients.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(c =>
                    c.NomeRazaoSocial.Contains(search) ||
                    c.Email.Contains(search) ||
                    c.CnpjCpf.Contains(search) ||
                    c.InscricaoEstadual.Contains(search) == true
                );
            }

            var clients = await query
                .Skip((page - 1) * 20)
                .Take(20)
                .ToListAsync();

            return Ok(clients);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter clientes.");
            return StatusCode(500, "Ocorreu um erro ao obter os clientes.");
        }
    }

    [HttpPost(Name = "CreateClient")]
    public async Task<ActionResult<Client>> PostClient(Client client)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var validationResult = await CheckClientInfo(client);
            if (validationResult != null)
            {
                return BadRequest(validationResult);
            }

            if (client.Password != client.PasswordConfirmation)
            {
                return BadRequest("As senhas não conferem.");
            }

            client.PasswordHash = BCrypt.Net.BCrypt.HashPassword(client.Password);
            client.Password = string.Empty; 
            client.PasswordConfirmation = string.Empty; 
            client.DateCreated = DateTime.Now;

            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetClients", new { id = client.Id }, client);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar cliente.");
            return StatusCode(500, "Um erro ocorreu ao criar o cliente.");
        }
    }

    [HttpPut("{id:int}", Name = "UpdateClient")]
    public async Task<IActionResult> PutClient(int id, Client client)
    {
        try
        {
            if (id != client.Id)
            {
                return BadRequest();
            }

            var existingClient = await _context.Clients.FindAsync(id);

            if (existingClient == null)
            {
                return NotFound();
            }

            existingClient.NomeRazaoSocial = client.NomeRazaoSocial;
            existingClient.Email = client.Email;
            existingClient.CnpjCpf = client.CnpjCpf;
            existingClient.InscricaoEstadual = client.InscricaoEstadual?.ToString();
            existingClient.InscricaoEstadualIsento = client.InscricaoEstadualIsento;
            existingClient.Telefone = client.Telefone;
            existingClient.Genero = client.Genero?.ToString();
            existingClient.Status = client.Status;
            existingClient.DataNascimento = client.DataNascimento;

            if (!string.IsNullOrEmpty(client.Password) && client.Password != client.PasswordConfirmation)
            {
                return BadRequest("As senhas não conferem.");
            }

            if (!string.IsNullOrEmpty(client.Password))
            {
                existingClient.PasswordHash = BCrypt.Net.BCrypt.HashPassword(client.Password);
            }

            _context.Entry(existingClient).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            _logger.LogError(ex, "Erro de simultaneidade ao atualizar cliente.");
            if (!ClientExists(id))
            {
                return NotFound();
            }
            else
            {
                return StatusCode(409, "Erro de simultaneidade. O cliente pode ter sido modificado por outro usuário.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar cliente.");
            return StatusCode(500, "Um erro ocorreu ao atualizar o cliente.");
        }
    }

    [HttpDelete("{id:int}", Name = "DeleteClient")]
    public async Task<IActionResult> DeleteClient(int id)
    {
        try
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
            {
                return NotFound();
            }

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao deletar cliente.");
            return StatusCode(500, "Um erro ocorreu ao deletar o cliente.");
        }
    }

    private bool ClientExists(int id)
    {
        return _context.Clients.Any(e => e.Id == id);
    }

    private async Task<string?> CheckClientInfo(Client client)
    {
        if (string.IsNullOrEmpty(client.Password) || client.Password.Length < 8 || client.Password.Length > 15)
        {
            return "A senha é obrigatória e deve ter entre 8 e 15 caracteres.";
        }

        if (await _context.Clients.AnyAsync(c => c.Email == client.Email && c.Id != client.Id))
        {
            return "Este Email já existe na nossa base de dados.";
        }

        if (await _context.Clients.AnyAsync(c => c.CnpjCpf == client.CnpjCpf && c.Id != client.Id))
        {
            return "Este CPF/CNPJ já existe na nossa base de dados.";
        }

        if (!string.IsNullOrEmpty(client.InscricaoEstadual) && !client.InscricaoEstadualIsento)
        {
            if (await _context.Clients.AnyAsync(c => c.InscricaoEstadual == client.InscricaoEstadual && c.Id != client.Id))
            {
                return "Esta Inscrição Estadual já existe na nossa base de dados.";
            }
        }
        
        return null;
    }
}
