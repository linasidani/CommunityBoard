using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using BCrypt.Net;

var builder = WebApplication.CreateBuilder(args);

// Configuration
var jwtKey = "your-super-secret-key-min-32-characters-long-for-security";
var jwtIssuer = "CommunityBoardAPI";

// Add services
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=communityboard.db"));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
    SeedData(db);
}

app.UseCors("AllowReact");
app.UseAuthentication();
app.UseAuthorization();

// Helper functions
string GenerateJwtToken(User user)
{
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Username),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim(ClaimTypes.Role, user.Role)
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken(
        issuer: jwtIssuer,
        audience: jwtIssuer,
        claims: claims,
        expires: DateTime.Now.AddDays(7),
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}

int GetUserId(ClaimsPrincipal user) => 
    int.Parse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

string GetUserRole(ClaimsPrincipal user) => 
    user.FindFirst(ClaimTypes.Role)?.Value ?? "user";

// ============================================
// AUTH ENDPOINTS
// ============================================

app.MapPost("/api/auth/register", async (RegisterDto dto, AppDbContext db) =>
{
    if (await db.Users.AnyAsync(u => u.Email == dto.Email))
        return Results.BadRequest(new { error = "Email finns redan registrerad" });
    
    if (await db.Users.AnyAsync(u => u.Username == dto.Username))
        return Results.BadRequest(new { error = "Användarnamnet är redan taget" });

    var user = new User
    {
        Username = dto.Username,
        Email = dto.Email,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
        Role = "user"
    };

    db.Users.Add(user);
    await db.SaveChangesAsync();

    var token = GenerateJwtToken(user);
    return Results.Ok(new { token, user = new { user.Id, user.Username, user.Email, user.Role } });
});

app.MapPost("/api/auth/login", async (LoginDto dto, AppDbContext db) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
    
    if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        return Results.BadRequest(new { error = "Felaktigt användarnamn eller lösenord" });

    var token = GenerateJwtToken(user);
    return Results.Ok(new { token, user = new { user.Id, user.Username, user.Email, user.Role } });
});

// ============================================
// POSTS ENDPOINTS
// ============================================

app.MapGet("/api/posts", async (AppDbContext db) =>
{
    var posts = await db.PostsWithDetails.ToListAsync();
    return Results.Ok(posts);
});

app.MapGet("/api/posts/{id}", async (int id, AppDbContext db) =>
{
    var post = await db.PostsWithDetails.FirstOrDefaultAsync(p => p.Id == id);
    return post == null ? Results.NotFound() : Results.Ok(post);
});

app.MapPost("/api/posts", async (CreatePostDto dto, ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = GetUserId(user);
    var post = new Post
    {
        Title = dto.Title,
        Content = dto.Content,
        Category = dto.Category,
        UserId = userId,
        CreatedAt = DateTime.UtcNow
    };

    db.Posts.Add(post);
    await db.SaveChangesAsync();

    var postWithDetails = await db.PostsWithDetails.FirstOrDefaultAsync(p => p.Id == post.Id);
    return Results.Ok(postWithDetails);
}).RequireAuthorization();

app.MapPut("/api/posts/{id}", async (int id, UpdatePostDto dto, ClaimsPrincipal user, AppDbContext db) =>
{
    var post = await db.Posts.FindAsync(id);
    if (post == null) return Results.NotFound();

    var userId = GetUserId(user);
    var role = GetUserRole(user);

    if (post.UserId != userId && role != "admin")
        return Results.Forbid();

    post.Title = dto.Title;
    post.Content = dto.Content;
    post.Category = dto.Category;

    await db.SaveChangesAsync();

    var postWithDetails = await db.PostsWithDetails.FirstOrDefaultAsync(p => p.Id == id);
    return Results.Ok(postWithDetails);
}).RequireAuthorization();

app.MapDelete("/api/posts/{id}", async (int id, ClaimsPrincipal user, AppDbContext db) =>
{
    var post = await db.Posts.FindAsync(id);
    if (post == null) return Results.NotFound();

    var userId = GetUserId(user);
    var role = GetUserRole(user);

    if (post.UserId != userId && role != "admin")
        return Results.Forbid();

    db.Posts.Remove(post);
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Post deleted" });
}).RequireAuthorization();

// ============================================
// COMMENTS ENDPOINTS
// ============================================

app.MapGet("/api/posts/{postId}/comments", async (int postId, AppDbContext db) =>
{
    var comments = await db.Comments
        .Where(c => c.PostId == postId)
        .Join(db.Users, c => c.UserId, u => u.Id, (c, u) => new CommentDto
        {
            Id = c.Id,
            PostId = c.PostId,
            UserId = c.UserId,
            Username = u.Username,
            Content = c.Content,
            CreatedAt = c.CreatedAt
        })
        .OrderBy(c => c.CreatedAt)
        .ToListAsync();

    return Results.Ok(comments);
});

app.MapPost("/api/posts/{postId}/comments", async (int postId, CreateCommentDto dto, ClaimsPrincipal user, AppDbContext db) =>
{
    var userId = GetUserId(user);
    var comment = new Comment
    {
        PostId = postId,
        UserId = userId,
        Content = dto.Content,
        CreatedAt = DateTime.UtcNow
    };

    db.Comments.Add(comment);
    await db.SaveChangesAsync();

    var username = await db.Users.Where(u => u.Id == userId).Select(u => u.Username).FirstOrDefaultAsync();
    var commentDto = new CommentDto
    {
        Id = comment.Id,
        PostId = comment.PostId,
        UserId = comment.UserId,
        Username = username ?? "",
        Content = comment.Content,
        CreatedAt = comment.CreatedAt
    };

    return Results.Ok(commentDto);
}).RequireAuthorization();

app.MapDelete("/api/comments/{id}", async (int id, ClaimsPrincipal user, AppDbContext db) =>
{
    var comment = await db.Comments.FindAsync(id);
    if (comment == null) return Results.NotFound();

    var userId = GetUserId(user);
    var role = GetUserRole(user);

    if (comment.UserId != userId && role != "admin")
        return Results.Forbid();

    db.Comments.Remove(comment);
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Comment deleted" });
}).RequireAuthorization();

// ============================================
// USER STATS ENDPOINT (NYA!)
// ============================================

app.MapGet("/api/users/stats", async (AppDbContext db) =>
{
    var stats = await db.UserPostStats.ToListAsync();
    return Results.Ok(stats);
});

app.Run();

// ============================================
// SEED DATA
// ============================================
void SeedData(AppDbContext db)
{
    if (db.Users.Any()) return;

    var admin = new User
    {
        Username = "admin",
        Email = "admin@test.com",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
        Role = "Admin"
    };

    var user1 = new User
    {
        Username = "user1",
        Email = "user@test.com",
        PasswordHash = BCrypt.Net.BCrypt.HashPassword("User123!"),
        Role = "User"
    };

    db.Users.AddRange(admin, user1);
    db.SaveChanges();

    var post1 = new Post
    {
        Title = "Välkommen till Anslagstavlan!",
        Content = "Detta är den första posten på vår community board. Här kan du dela med dig av information, nyheter och meddelanden.",
        Category = "Allmänt",
        UserId = admin.Id,
        CreatedAt = DateTime.UtcNow
    };

    var post2 = new Post
    {
        Title = "Sökes: Hjälp med React",
        Content = "Jag behöver hjälp med att förstå React hooks bättre. Finns det någon som kan förklara useEffect?",
        Category = "Hjälp",
        UserId = user1.Id,
        CreatedAt = DateTime.UtcNow.AddDays(-1)
    };

    db.Posts.AddRange(post1, post2);
    db.SaveChanges();

    var comment1 = new Comment
    {
        PostId = post1.Id,
        UserId = user1.Id,
        Content = "Tack för att du skapade denna plattform!",
        CreatedAt = DateTime.UtcNow
    };

    var comment2 = new Comment
    {
        PostId = post1.Id,
        UserId = admin.Id,
        Content = "Varsågod! Hoppas ni får användning för den.",
        CreatedAt = DateTime.UtcNow
    };

    var comment3 = new Comment
    {
        PostId = post2.Id,
        UserId = admin.Id,
        Content = "useEffect körs efter render. Används för side effects som API-calls.",
        CreatedAt = DateTime.UtcNow
    };

    db.Comments.AddRange(comment1, comment2, comment3);
    db.SaveChanges();
}

// ============================================
// MODELS & DTOs
// ============================================

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "user";
}

public class Post
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public string Category { get; set; } = "";
    public int UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ImageUrl { get; set; }
}

public class Comment
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int UserId { get; set; }
    public string Content { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public class PostWithDetails
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Content { get; set; } = "";
    public string Category { get; set; } = "";
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public int CommentCount { get; set; }
}

public class UserPostStats
{
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public int PostCount { get; set; }
    public int CommentCount { get; set; }
    public DateTime? LastActivityDate { get; set; }
}

public record RegisterDto(string Username, string Email, string Password);
public record LoginDto(string Email, string Password);
public record CreatePostDto(string Title, string Content, string Category);
public record UpdatePostDto(string Title, string Content, string Category);
public record CreateCommentDto(string Content);

public class CommentDto
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int UserId { get; set; }
    public string Username { get; set; } = "";
    public string Content { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

// ============================================
// DATABASE CONTEXT
// ============================================

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<PostWithDetails> PostsWithDetails { get; set; }
    public DbSet<UserPostStats> UserPostStats { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // PostsWithDetails as a keyless entity (SQL View)
        modelBuilder.Entity<PostWithDetails>()
            .HasNoKey()
            .ToView("PostsWithDetails");

        // Create the view in SQLite
        modelBuilder.Entity<PostWithDetails>()
            .ToSqlQuery(@"
                SELECT 
                    p.Id,
                    p.Title,
                    p.Content,
                    p.Category,
                    p.UserId,
                    u.Username,
                    p.CreatedAt,
                    COUNT(c.Id) as CommentCount
                FROM Posts p
                JOIN Users u ON p.UserId = u.Id
                LEFT JOIN Comments c ON p.Id = c.PostId
                GROUP BY p.Id, p.Title, p.Content, p.Category, p.UserId, u.Username, p.CreatedAt
            ");

        // UserPostStats as a keyless entity (SQL View)
        modelBuilder.Entity<UserPostStats>()
            .HasNoKey()
            .ToView("UserPostStats");

        modelBuilder.Entity<UserPostStats>()
            .ToSqlQuery(@"
                SELECT 
                    u.Id as UserId,
                    u.Username,
                    u.Email,
                    COUNT(DISTINCT p.Id) as PostCount,
                    COUNT(DISTINCT c.Id) as CommentCount,
                    MAX(COALESCE(p.CreatedAt, c.CreatedAt)) as LastActivityDate
                FROM Users u
                LEFT JOIN Posts p ON u.Id = p.UserId
                LEFT JOIN Comments c ON u.Id = c.UserId
                GROUP BY u.Id, u.Username, u.Email
            ");
    }
}