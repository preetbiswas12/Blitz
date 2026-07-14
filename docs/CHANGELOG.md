# Changelog

All notable changes to Legion CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Memory system with LEGION.md support
- Test runner tool with auto-detection
- Git integration tools (PR, conflict, blame)
- ELC (Everything Legion Code) skills, commands, agents, rules
- Context mode (lazy senior dev)
- Multi-model support for 500+ models
- Provider fallback chains
- Cost tracking and limits
- MCP server integration

### Changed
- Rebranded to Legion CLI
- Updated system prompts for better performance
- Improved tool registration system
- Enhanced plugin architecture

### Fixed
- Provider-specific error handling
- Tool execution reliability
- Session persistence

## [0.1.0] - 2024-01-01

### Added
- Initial release
- Core CLI functionality
- Basic tool system
- Provider integrations
- Session management

## [0.0.1] - 2023-12-01

### Added
- Project scaffolding
- Basic architecture
- Development setup

## [0.0.0] - 2023-11-01

### Added
- Initial commit
- Repository setup

---

## Versioning

Legion CLI follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html):

- **MAJOR** - Incompatible API changes
- **MINOR** - New functionality (backwards compatible)
- **PATCH** - Bug fixes (backwards compatible)

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release PR
4. Merge to main
5. Create GitHub release
6. Publish to npm

## Migration Guides

### Upgrading to 0.1.0
- Update configuration format
- See [Configuration Guide](guides/configuration.md)

### Upgrading to 0.2.0
- New memory system
- See [Memory Guide](guides/memory-system.md)
