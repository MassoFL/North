# 🏗️ Architecture - Intégration Excalidraw

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                    LokedIn Application                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │  Objectif 1 │  │  Objectif 2 │  │  Objectif 3 │     │
│  │             │  │             │  │             │     │
│  │  📋 [+] [⋯] │  │  📋 [+] [⋯] │  │  📋 [+] [⋯] │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┴────────────────┘             │
│                          │                               │
│                          ▼                               │
│              ┌───────────────────────┐                  │
│              │  Whiteboard Modal     │                  │
│              │  ┌─────────────────┐  │                  │
│              │  │   Excalidraw    │  │                  │
│              │  │   Component     │  │                  │
│              │  └─────────────────┘  │                  │
│              └───────────────────────┘                  │
│                          │                               │
│                          ▼                               │
│              ┌───────────────────────┐                  │
│              │   Supabase Database   │                  │
│              │   whiteboard_data     │                  │
│              └───────────────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

## Flux de données

### 1. Ouverture du tableau blanc

```
User clicks 📋
    ↓
openWhiteboard(skillId)
    ↓
Load skill data from this.skills
    ↓
Show modal
    ↓
initializeExcalidraw(savedData)
    ↓
React.createElement(Excalidraw)
    ↓
ReactDOM.render()
    ↓
Excalidraw ready with saved data
```

### 2. Sauvegarde

```
User clicks 💾 Sauvegarder
    ↓
saveWhiteboard()
    ↓
excalidrawAPI.getSceneElements()
excalidrawAPI.getAppState()
excalidrawAPI.getFiles()
    ↓
Create whiteboardData object
    ↓
supabase.from('skills').update()
    ↓
Update local this.skills array
    ↓
Show "✓ Sauvegardé" feedback
    ↓
renderSkills() to update button indicator
```

### 3. Fermeture

```
User clicks ×
    ↓
closeWhiteboard()
    ↓
Hide modal
    ↓
ReactDOM.unmountComponentAtNode()
    ↓
Clean up references
    ↓
Reset currentWhiteboardSkillId
```

## Structure des composants

### HTML Structure

```html
<div id="whiteboardModal" class="modal whiteboard-modal">
  <div class="whiteboard-container">
    <div class="whiteboard-header">
      <h2 id="whiteboardTitle">Tableau blanc - [Skill Name]</h2>
      <div class="whiteboard-actions">
        <button class="save-whiteboard-btn">💾 Sauvegarder</button>
        <button class="close-btn">×</button>
      </div>
    </div>
    <div id="excalidrawContainer" class="excalidraw-wrapper">
      <!-- React component rendered here -->
    </div>
  </div>
</div>
```

### JavaScript Classes

```javascript
class SkillsTracker {
  // Properties
  excalidrawAPI: null
  currentWhiteboardSkillId: null
  
  // Methods
  openWhiteboard(skillId)
  initializeExcalidraw(savedData)
  saveWhiteboard()
  closeWhiteboard()
}
```

### Database Schema

```sql
skills {
  id: BIGSERIAL PRIMARY KEY
  name: VARCHAR(100)
  hours: INTEGER
  type: VARCHAR(20)
  user_id: UUID
  whiteboard_data: JSONB  ← NEW
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

## Structure des données JSON

### whiteboard_data format

```json
{
  "elements": [
    {
      "id": "element-id-1",
      "type": "rectangle",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 100,
      "strokeColor": "#000000",
      "backgroundColor": "#ffffff",
      ...
    },
    {
      "id": "element-id-2",
      "type": "text",
      "text": "Mon texte",
      "x": 150,
      "y": 150,
      ...
    }
  ],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "currentItemStrokeColor": "#000000",
    "currentItemBackgroundColor": "#ffffff",
    "gridSize": null,
    ...
  },
  "files": {
    "file-id-1": {
      "mimeType": "image/png",
      "dataURL": "data:image/png;base64,...",
      ...
    }
  }
}
```

## Dépendances externes

### CDN Scripts (loaded in index.html)

```
1. Supabase Client
   https://unpkg.com/@supabase/supabase-js@2

2. React 18
   https://unpkg.com/react@18/umd/react.production.min.js

3. ReactDOM 18
   https://unpkg.com/react-dom@18/umd/react-dom.production.min.js

4. Excalidraw 0.17.0
   https://unpkg.com/@excalidraw/excalidraw@0.17.0/dist/excalidraw.production.min.js
```

### Loading Order

```
1. Supabase (for auth & data)
2. React (required by Excalidraw)
3. ReactDOM (required by Excalidraw)
4. Excalidraw (the whiteboard component)
5. script.js (our application logic)
```

## État de l'application

### Global State

```javascript
{
  user: User | null,
  skills: Skill[],
  excalidrawAPI: ExcalidrawAPI | null,
  currentWhiteboardSkillId: number | null
}
```

### Skill Object

```javascript
{
  id: number,
  name: string,
  hours: number,
  type: 'continuous' | 'project' | 'target',
  user_id: string,
  whiteboard_data: WhiteboardData | null,  ← NEW
  milestones?: string,
  target?: number,
  target_unit?: string,
  order_index?: number,
  archived: boolean
}
```

## Sécurité

### Row Level Security (RLS)

```sql
-- Les utilisateurs ne peuvent voir que leurs propres whiteboards
CREATE POLICY "Users can view own skills" ON skills
  FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs ne peuvent modifier que leurs propres whiteboards
CREATE POLICY "Users can update own skills" ON skills
  FOR UPDATE USING (auth.uid() = user_id);
```

### Data Validation

- Whiteboard data is stored as JSONB (validated by PostgreSQL)
- User authentication required (Supabase Auth)
- RLS policies enforce user isolation
- No direct SQL injection possible (using Supabase client)

## Performance

### Optimizations

1. **Lazy Loading**: Excalidraw only loaded when modal opens
2. **Manual Save**: No auto-save to reduce DB writes
3. **JSONB Storage**: Efficient storage and querying
4. **Index**: Fast lookup for skills with whiteboards
5. **Component Cleanup**: React components unmounted on close

### Potential Improvements

1. **Auto-save**: Debounced save every 30 seconds
2. **Compression**: Compress whiteboard_data before storage
3. **Caching**: Cache whiteboard data in localStorage
4. **Lazy Images**: Load images on demand
5. **Service Worker**: Offline support

## Responsive Design

### Desktop (> 768px)
- Modal: 95vw × 95vh
- Rounded corners
- Centered on screen

### Mobile (≤ 768px)
- Modal: 100vw × 100vh (fullscreen)
- No rounded corners
- Optimized touch controls

### Tablet (768px - 1024px)
- Same as desktop
- Touch-friendly buttons

## Error Handling

### Scenarios

1. **Excalidraw fails to load**
   - Check CDN availability
   - Fallback: Show error message

2. **Save fails**
   - Show error alert
   - Keep data in memory
   - Retry option

3. **Load fails**
   - Start with empty canvas
   - Log error to console

4. **Network issues**
   - Supabase handles retries
   - Show connection error

## Testing Strategy

### Unit Tests (potential)
- `openWhiteboard()` initializes correctly
- `saveWhiteboard()` formats data correctly
- `closeWhiteboard()` cleans up properly

### Integration Tests
- Full flow: open → draw → save → close → reopen
- Multiple skills with different whiteboards
- Mobile vs desktop behavior

### E2E Tests
- User journey from login to whiteboard usage
- Data persistence across sessions
- Cross-browser compatibility

---

**Architecture Version**: 1.0
**Last Updated**: 29 Nov 2024
