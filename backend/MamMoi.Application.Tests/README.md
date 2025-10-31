# MamMoi.Application.Tests

Project này chứa unit tests cho **Application layer**.

## 📚 Test Frameworks

- **xUnit**: Framework chạy tests
- **Moq**: Mock dependencies (repositories, services)
- **FluentAssertions**: Viết assertions dễ đọc hơn

## 🗂️ Cấu trúc

```
MamMoi.Application.Tests/
├── Services/
│   └── UserServiceTests.cs          # Tests cho UserService
├── DTOs/
│   └── (Tests cho validation DTOs)
└── README.md
```

## ▶️ Chạy Tests

```powershell
# Chạy tất cả tests
dotnet test

# Chạy tests với output chi tiết
dotnet test --verbosity normal

# Chạy tests và xem code coverage
dotnet test --collect:"XPlat Code Coverage"
```

## 📝 Ví dụ Test

```csharp
[Fact]
public async Task GetByIdAsync_ShouldReturnUser_WhenUserExists()
{
    // Arrange - Chuẩn bị data
    var userId = Guid.NewGuid();
    _mockUserRepository.Setup(x => x.GetByIdAsync(It.IsAny<int>()))
        .ReturnsAsync(new User { UserId = 1, Email = "test@example.com" });

    // Act - Thực hiện action
    var result = await _userService.GetByIdAsync(userId);

    // Assert - Kiểm tra kết quả
    result.Should().NotBeNull();
    result.Email.Should().Be("test@example.com");
}
```

## ✅ Best Practices

1. **AAA Pattern**: Arrange → Act → Assert
2. **Tên test rõ ràng**: `MethodName_Should_ExpectedBehavior_When_Condition`
3. **Mock dependencies**: Không phụ thuộc vào database thật
4. **Test isolated**: Mỗi test độc lập, không phụ thuộc nhau
5. **Coverage**: Cố gắng đạt > 80% code coverage

## 🔧 Lưu ý

- Tests hiện tại đang commented vì cần implement `IUserService` từ Infrastructure layer
- Uncomment và update tests khi UserService đã sẵn sàng
- Thêm tests cho edge cases, validation, exceptions
