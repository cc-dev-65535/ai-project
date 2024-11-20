import React, { useState, useContext } from 'react';
import { AuthContext } from './auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const API_VERSION = "/API/v1";

const STORY_URL =
  process.env.NODE_ENV === "production"
    ? `https://client-app-ebon.vercel.app${API_VERSION}/story`
    : `http://localhost:4000${API_VERSION}/story`;

const storyAPICall = async (url, method, data = null, headers = {}) => {
    const option = {
        method: method,
        credentials: "include",
        headers: { 
        "Content-Type": "application/json",
        ...headers },
    };
    if (data) option.body = JSON.stringify(data);
    
    try {
        const response = await fetch(url, option);
        const data = await response.json();
        if (!response.ok)
            throw new Error(data.error || "Error fetching database response");
        return data;
    } catch (error) {
        console.error("API error:", error);
        throw new Error(
        "Server returned an invalid response. Check if the server is running and accessible."
        );
    }
    };
    
const storyAPI = {
    get: (url) => storyAPICall(url, "GET"),
    put: (url, data) => storyAPICall(url, "PUT", data),
    delete: (url) => storyAPICall(url, "DELETE"),
    }
      

const StoryCards = () => {
  const [isEditing, setIsEditing] = useState(null);
  const queryClient = useQueryClient();
  const authState = useContext(AuthContext);

  // Fetch stories
  const { data: stories = [], isLoading, isError } = useQuery({
    queryKey: ['stories'],
    queryFn: async () => {
        const fetchedStories = await storyAPI.get(STORY_URL);
        return fetchedStories.map(story => ({ ...story, isExpanded: false }));
    }
  });

  const handleExpand = (id) => {
    console.log(stories)    
    const updatedStories = stories.map(story => 
        story.id === id ? { ...story, isExpanded: !story.isExpanded } : story
    );
    queryClient.setQueryData(['stories'], updatedStories);
  };

  const startEditing = (id) => {
    setIsEditing(id);
  };

  const cancelEditing = () => {
    setIsEditing(null);
  };

  const saveTitle = async (id, newTitle) => {
    try {
      await storyAPI.put(STORY_URL, {storyId: id , newTitle: newTitle });
      setIsEditing(null);
      // Invalidate and refetch
      queryClient.invalidateQueries(['stories']);
    } catch (error) {
      console.error('Failed to update story:', error);
      alert('Failed to update story title');
    }
  };

  const deleteStory = async (id) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await storyAPI.delete(`${STORY_URL}?storyId=${id}`);
        queryClient.invalidateQueries(['stories']);
      } catch (error) {
        console.error('Failed to delete story:', error);
        alert('Failed to delete story');
      }
    }
  };

  if (!authState?.status) {
    return <h1 className="text-center">Please log in to continue</h1>;
  }

  if (isLoading) return <div className="text-center">Loading stories...</div>;
  if (isError) return <div className="text-center text-danger">Error loading stories</div>;

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow p-4">
            <h2 className="text-center mb-4">Your Stories</h2>
            <div className="d-flex flex-column" style={{ gap: "10px" }}>
              {stories.length === 0 ? (
                <p className="text-center text-muted">No stories saved yet</p>
              ) : (
                stories.map(story => (
                  <div key={story.id} className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        {isEditing === story.id ? (
                          <div className="d-flex gap-2 flex-grow-1">
                            <input
                              type="text"
                              className="form-control"
                              defaultValue={story.title}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  saveTitle(story.id, e.target.value);
                                }
                              }}
                            />
                            <button 
                              className="btn btn-primary"
                              onClick={() => {
                                const newTitle = document.querySelector(`input[value="${story.title}"]`).value;
                                saveTitle(story.id, newTitle);
                              }}
                            >
                              Save
                            </button>
                            <button 
                              className="btn btn-secondary"
                              onClick={cancelEditing}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <h5 className="card-title mb-0" style={{ cursor: 'pointer' }} onClick={() => handleExpand(story.id)}>
                            {story.title}
                          </h5>
                        )}
                        
                        {isEditing !== story.id && (
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-secondary btn-sm"
                              onClick={() => startEditing(story.id)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => deleteStory(story.id)}
                            >
                              Delete
                            </button>
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleExpand(story.id)}
                            >
                              {story.isExpanded ? "▼" : "▶"}
                            </button>
                          </div>
                        )}
                      </div>

                      {story.isExpanded && (
                        <div className="mt-3">
                          <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>
                            {story.content}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCards;