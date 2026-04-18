import httpx
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta


GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0"


class GraphClient:
    def __init__(self, access_token: str):
        self.access_token = access_token
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

    async def get_me(self) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GRAPH_BASE_URL}/me",
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def get_messages(
        self,
        top: int = 50,
        filter_query: Optional[str] = None,
        select: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        params: Dict[str, Any] = {"$top": top, "$orderby": "receivedDateTime desc"}

        if filter_query:
            params["$filter"] = filter_query

        if select:
            params["$select"] = ",".join(select)
        else:
            params["$select"] = "id,subject,from,receivedDateTime,bodyPreview,body,importance,hasAttachments"

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GRAPH_BASE_URL}/me/messages",
                headers=self.headers,
                params=params,
            )
            response.raise_for_status()
            return response.json()

    async def get_message(self, message_id: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GRAPH_BASE_URL}/me/messages/{message_id}",
                headers=self.headers,
            )
            response.raise_for_status()
            return response.json()

    async def get_calendar_events(
        self,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        top: int = 20,
    ) -> Dict[str, Any]:
        if not start_date:
            start_date = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        if not end_date:
            end_dt = datetime.utcnow() + timedelta(days=30)
            end_date = end_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

        params = {
            "$top": top,
            "$orderby": "start/dateTime",
            "startDateTime": start_date,
            "endDateTime": end_date,
            "$select": "id,subject,start,end,location,organizer,bodyPreview,isOnlineMeeting,onlineMeetingUrl",
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{GRAPH_BASE_URL}/me/calendarView",
                headers=self.headers,
                params=params,
            )
            response.raise_for_status()
            return response.json()

    async def create_calendar_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{GRAPH_BASE_URL}/me/events",
                headers=self.headers,
                json=event_data,
            )
            response.raise_for_status()
            return response.json()

    async def delete_calendar_event(self, event_id: str) -> bool:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{GRAPH_BASE_URL}/me/events/{event_id}",
                headers=self.headers,
            )
            return response.status_code == 204
