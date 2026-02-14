import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { DividerModule } from 'primeng/divider';

interface Photo { itemImageSrc: string; thumbnailImageSrc: string; alt: string; title: string; }
interface Video { src: string; thumbnail: string; title: string; description: string; }

@Component({
  selector: 'app-venue-showcase',
  standalone: true,
  imports: [CommonModule, RouterLink, GalleriaModule, CardModule, ButtonModule, ImageModule, DividerModule],
  templateUrl: './venue-showcase.component.html',
  styleUrls: ['./venue-showcase.component.scss']
})
export class VenueShowcaseComponent implements OnInit {
  photos: Photo[] = [];
  videos: Video[] = [];
  amenities = [
    { icon: 'pi pi-home', title: 'Comfortable Cabins', description: 'Rustic cabins nestled among the redwoods' },
    { icon: 'pi pi-users', title: 'Meeting Spaces', description: 'Multiple conference rooms and gathering areas' },
    { icon: 'pi pi-sun', title: 'Outdoor Activities', description: 'Hiking trails, sports fields, and recreation areas' },
    { icon: 'pi pi-heart', title: 'Worship Spaces', description: 'Beautiful chapel and outdoor worship areas' },
    { icon: 'pi pi-shopping-bag', title: 'Dining Hall', description: 'Delicious meals in a communal setting' },
    { icon: 'pi pi-wifi', title: 'Modern Amenities', description: 'Wi-Fi and AV equipment available' }
  ];
  responsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];

  ngOnInit(): void {
    this.photos = [
      { itemImageSrc: 'assets/venue/photos/redwoods-1.jpg', thumbnailImageSrc: 'assets/venue/photos/thumbs/redwoods-1.jpg', alt: 'Redwood Forest', title: 'Majestic Redwoods' },
      { itemImageSrc: 'assets/venue/photos/cabin-1.jpg', thumbnailImageSrc: 'assets/venue/photos/thumbs/cabin-1.jpg', alt: 'Cabin Exterior', title: 'Rustic Cabins' },
      { itemImageSrc: 'assets/venue/photos/chapel-1.jpg', thumbnailImageSrc: 'assets/venue/photos/thumbs/chapel-1.jpg', alt: 'Chapel', title: 'Worship Chapel' },
      { itemImageSrc: 'assets/venue/photos/dining-1.jpg', thumbnailImageSrc: 'assets/venue/photos/thumbs/dining-1.jpg', alt: 'Dining Hall', title: 'Dining Hall' },
      { itemImageSrc: 'assets/venue/photos/trails-1.jpg', thumbnailImageSrc: 'assets/venue/photos/thumbs/trails-1.jpg', alt: 'Hiking Trails', title: 'Nature Trails' },
      { itemImageSrc: 'assets/venue/photos/meeting-1.jpg', thumbnailImageSrc: 'assets/venue/photos/thumbs/meeting-1.jpg', alt: 'Meeting Room', title: 'Conference Spaces' }
    ];
    this.videos = [
      { src: 'assets/venue/videos/tour-1.mp4', thumbnail: 'assets/venue/videos/thumbs/tour-1.jpg', title: 'Grounds Tour', description: 'Take a virtual tour of the beautiful Alliance Redwoods grounds' },
      { src: 'assets/venue/videos/cabins-1.mp4', thumbnail: 'assets/venue/videos/thumbs/cabins-1.jpg', title: 'Cabin Experience', description: 'See the comfortable accommodations' },
      { src: 'assets/venue/videos/activities-1.mp4', thumbnail: 'assets/venue/videos/thumbs/activities-1.jpg', title: 'Activities & Recreation', description: 'Explore the outdoor activities and recreation opportunities' }
    ];
  }

  openWebsite(): void { window.open('https://allianceredwoods.com', '_blank'); }
}
