# Search Address By Sub District

List of districts with direct search by Subdistrict name. We limit requests using throttle limitation, if it is too close then the system will suspend your API call temporarily

:::warning
**Diclaimer**: There are separate APIs for Pos Indonesia, RPX, and Paxel services. Please contact our technical team for more information.
:::

```shell
[GET] /api/mitra/v6.1/addresses
```

:::warning
The request must be sent via URL parameters (query params), not in the request body (raw body).
:::

### Request

| Field    | DataType       | Nullable | Desc                     |
| -------- | -------------- | -------- | ------------------------ |
| `search` | string(min: 3) | `false`  | Name of Sub district keyword |

```json
{
  "search": "Ngemplak"
}
```

### Response

```json
{
  "status": true,
 
  "text": "Success",
 
  "method": "addresses",
 
  "data": [
 
    {
 
      "subdistrict_id": 1251, 
      "district_id": 501,
 
      "city_id": 501,
 
      "province_id": 501,
 
      "text": "Widodo Martani, Ngemplak, Kabupaten Sleman, DI Yogyakarta, 55584"
 
    } 
  ]
 
}
```
