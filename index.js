import linebot from 'linebot'
import dotenv from 'dotenv'
import axios from 'axios'
import fs from 'fs'

// 讓套件讀取.env 檔案
// 讀取後可以使用process.env 變數 使用
dotenv.config()
const distance = (lat1, lon1, lat2, lon2, unit = 'K') => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0
  } else {
    const radlat1 = (Math.PI * lat1) / 180
    const radlat2 = (Math.PI * lat2) / 180
    const theta = lon1 - lon2
    const radtheta = (Math.PI * theta) / 180
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
    if (dist > 1) {
      dist = 1
    }
    dist = Math.acos(dist)
    dist = (dist * 180) / Math.PI
    dist = dist * 60 * 1.1515
    if (unit === 'K') {
      dist = dist * 1.609344
    }
    if (unit === 'N') {
      dist = dist * 0.8684
    }
    return dist
  }
}

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

bot.listen('/', process.env.PORT, () => {
  console.log('機器人啟動')
})

bot.on('message', async event => {
  const flex = {
    type: 'carousel',
    contents: [
    ]
  }
  const bubbles = []
  const { data } = await axios.get('https://parks.taipei/parks/api/')
  if (event.message.type === 'text') {
    let sport = ''
    let recreation = ''
    let service = ''
    try {
      for (const d of data) {
        const a = d.pm_libie.split(',')
        if (d.pm_location.includes(event.message.text) || a.some(a => a === event.message.text)) {
          if (d.pm_sports !== '') {
            sport = d.pm_sports
          } else {
            sport = '無運動設施'
          }
          if (d.pm_recreation !== '') {
            recreation = d.pm_recreation
          } else {
            recreation = '無遊樂設施'
          }
          if (d.pm_service !== '') {
            service = d.pm_service
          } else {
            service = '無服務設施'
          }
          console.log(d)
          const z = {
            type: 'bubble',
            size: 'kilo',
            hero: {
              type: 'image',
              url: 'https://parks.taipei/parks/images/C2-1.jpg',
              size: 'full',
              aspectMode: 'cover',
              aspectRatio: '320:213'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'box',
                  layout: 'baseline',
                  contents: [
                    {
                      type: 'icon',
                      url: 'https://crockerpark.com/wp-content/uploads/DirectoryIcon.png',
                      size: 'xl'
                    },
                    {
                      type: 'text',
                      text: `${d.pm_name}`,
                      weight: 'bold',
                      size: '20px',
                      margin: 'md',
                      offsetStart: 'none'
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  margin: 'lg',
                  spacing: 'lg',
                  contents: [
                    {
                      type: 'box',
                      layout: 'baseline',
                      spacing: 'sm',
                      contents: [
                        {
                          type: 'text',
                          text: '地址',
                          color: '#666666',
                          size: 'sm',
                          flex: 2
                        },
                        {
                          type: 'text',
                          text: `${d.pm_location}`,
                          wrap: true,
                          color: '#666666',
                          size: 'sm',
                          flex: 5
                        }
                      ],
                      margin: '4px',
                      paddingTop: '4px',
                      paddingBottom: '4px'
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      spacing: 'sm',
                      contents: [
                        {
                          type: 'box',
                          layout: 'baseline',
                          spacing: 'sm',
                          contents: [
                            {
                              type: 'text',
                              text: '運動器材',
                              color: '#666666',
                              size: 'sm',
                              flex: 2
                            },
                            {
                              type: 'text',
                              text: sport,
                              wrap: true,
                              color: '#666666',
                              size: 'sm',
                              flex: 5
                            }
                          ]
                        }
                      ],
                      margin: '3px',
                      paddingTop: '3px',
                      paddingBottom: '3px'
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'box',
                          layout: 'baseline',
                          spacing: 'sm',
                          contents: [
                            {
                              type: 'text',
                              text: '遊樂器材',
                              color: '#666666',
                              size: 'sm',
                              flex: 2
                            },
                            {
                              type: 'text',
                              text: recreation,
                              wrap: true,
                              color: '#666666',
                              size: 'sm',
                              flex: 5
                            }
                          ]
                        }
                      ]
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'box',
                          layout: 'baseline',
                          spacing: 'sm',
                          contents: [
                            {
                              type: 'text',
                              text: '服務設施',
                              color: '#666666',
                              size: 'sm',
                              flex: 2
                            },
                            {
                              type: 'text',
                              text: service,
                              wrap: true,
                              color: '#666666',
                              size: 'sm',
                              flex: 5
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ],
              spacing: 'xl',
              paddingAll: '15px'
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'button',
                  action: {
                    type: 'uri',
                    label: '地圖',
                    uri: `http://maps.google.com/maps?q=loc:${encodeURI(d.pm_lat)},${encodeURI(d.pm_lon)}`
                  },
                  height: 'sm',
                  margin: 'md'
                  // style: 'primary'
                },
                {
                  type: 'button',
                  action: {
                    type: 'postback',
                    label: '交通資訊',
                    text: '交通資訊',
                    data: '交通資訊&' + `${d.pm_transit}`
                  },
                  height: 'sm',
                  margin: 'md'
                  // style: 'primary'
                }
              ]
            },
            styles: {
              footer: {
                separator: true
              }
            }
          }
          bubbles.push(z)
        }
      }
    } catch (error) {
      console.log(error)
      event.reply('發生錯誤')
    }
  } else if (event.message.type === 'location') {
    let sport = ''
    let recreation = ''
    let service = ''
    try {
      for (const d of data) {
        const km = distance(d.pm_lat, d.pm_lon, event.message.latitude, event.message.longitude)
        if (d.pm_sports !== '') {
          sport = d.pm_sports
        } else {
          sport = '無運動設施'
        }
        if (d.pm_recreation !== '') {
          recreation = d.pm_recreation
        } else {
          recreation = '無遊樂設施'
        }
        if (d.pm_service !== '') {
          service = d.pm_service
        } else {
          service = '無服務設施'
        }
        if (km <= 0.5) {
          const z = {
            type: 'bubble',
            size: 'kilo',
            hero: {
              type: 'image',
              url: 'https://parks.taipei/parks/images/C1-1.jpg',
              size: 'full',
              aspectMode: 'cover',
              aspectRatio: '320:213'
            },
            body: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'box',
                  layout: 'baseline',
                  contents: [
                    {
                      type: 'icon',
                      url: 'https://crockerpark.com/wp-content/uploads/DirectoryIcon.png',
                      size: 'xl'
                    },
                    {
                      type: 'text',
                      text: `${d.pm_name}`,
                      weight: 'bold',
                      size: '20px',
                      margin: 'md',
                      offsetStart: 'none'
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  margin: 'lg',
                  spacing: 'lg',
                  contents: [
                    {
                      type: 'box',
                      layout: 'baseline',
                      spacing: 'sm',
                      contents: [
                        {
                          type: 'text',
                          text: '地址',
                          color: '#666666',
                          size: 'sm',
                          flex: 2
                        },
                        {
                          type: 'text',
                          text: `${d.pm_location}`,
                          wrap: true,
                          color: '#666666',
                          size: 'sm',
                          flex: 5
                        }
                      ],
                      margin: '4px',
                      paddingTop: '4px',
                      paddingBottom: '4px'
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      spacing: 'sm',
                      contents: [
                        {
                          type: 'box',
                          layout: 'baseline',
                          spacing: 'sm',
                          contents: [
                            {
                              type: 'text',
                              text: '運動器材',
                              color: '#666666',
                              size: 'sm',
                              flex: 2
                            },
                            {
                              type: 'text',
                              text: sport,
                              wrap: true,
                              color: '#666666',
                              size: 'sm',
                              flex: 5
                            }
                          ]
                        }
                      ],
                      margin: '3px',
                      paddingTop: '3px',
                      paddingBottom: '3px'
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'box',
                          layout: 'baseline',
                          spacing: 'sm',
                          contents: [
                            {
                              type: 'text',
                              text: '遊樂器材',
                              color: '#666666',
                              size: 'sm',
                              flex: 2
                            },
                            {
                              type: 'text',
                              text: recreation,
                              wrap: true,
                              color: '#666666',
                              size: 'sm',
                              flex: 5
                            }
                          ]
                        }
                      ]
                    },
                    {
                      type: 'box',
                      layout: 'vertical',
                      contents: [
                        {
                          type: 'box',
                          layout: 'baseline',
                          spacing: 'sm',
                          contents: [
                            {
                              type: 'text',
                              text: '服務設施',
                              color: '#666666',
                              size: 'sm',
                              flex: 2
                            },
                            {
                              type: 'text',
                              text: service,
                              wrap: true,
                              color: '#666666',
                              size: 'sm',
                              flex: 5
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ],
              spacing: 'xl',
              paddingAll: '15px'
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'button',
                  action: {
                    type: 'uri',
                    label: '地圖',
                    uri: `http://maps.google.com/maps?q=loc:${encodeURI(d.pm_lat)},${encodeURI(d.pm_lon)}`
                  },
                  height: 'sm',
                  margin: 'md',
                  style: 'primary'
                },
                {
                  type: 'button',
                  action: {
                    type: 'postback',
                    label: '交通資訊',
                    text: '交通資訊',
                    data: '交通資訊&' + `${d.pm_transit}`
                  },
                  height: 'sm',
                  margin: 'md',
                  style: 'primary'
                }
              ]
            }
            // ,
            // styles: {
            //   footer: {
            //     separator: true
            //   }
            // }
          }
          bubbles.push(z)
        }
      }
    } catch (error) {
      event.reply('發生錯誤')
    }
  }
  flex.contents = bubbles
  const message = {
    type: 'flex',
    altText: '尋找的公園',
    contents: flex
  }

  fs.writeFileSync('aaa.json', JSON.stringify(message, null, 2))
  event.reply(message)
})
bot.on('postback', async event => {
  let area = ''
  if (event.postback.data.slice(0, 4) === '交通資訊') {
    area = event.postback.data.slice(5)
    event.reply(area)
  }
})
