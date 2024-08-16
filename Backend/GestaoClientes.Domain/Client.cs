using System.ComponentModel.DataAnnotations;

namespace GestaoClientes.Domain;

public class Client
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string NomeRazaoSocial { get; set; } = null!;

    [Required]
    [MaxLength(14)]
    public string CnpjCpf { get; set; } = null!;

    [Required]
    [MaxLength(150)]
    [EmailAddress]
    public string Email { get; set; } = null!;

    [Required]
    public string TipoPessoa { get; set; } = null!;

    [Required]
    [MaxLength(11)]
    [Phone]
    public string Telefone { get; set; } = null!;

    [MaxLength(12)]
    public string? InscricaoEstadual { get; set; }

    [Required]
    public bool InscricaoEstadualIsento { get; set; } 

    public string? Genero { get; set; } = null!;

    public DateTime? DataNascimento { get; set; }

    public DateTime DateCreated { get; set; } 

    public ClientStatus Status { get; set; } = ClientStatus.Active; 

    [MinLength(8)]
    [MaxLength(15)]
    public string? Password { get; set; }
    public string? PasswordConfirmation { get; set; }

    public string? PasswordHash { get; set; } 
}

public enum ClientStatus
{
    Active,
    Blocked
}
