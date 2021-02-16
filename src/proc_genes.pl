#!/usr/bin/perl
  $count=0;
while(<>) {
  $line=$_;
  chomp($line);
  if ($line=~/\"t\"/) {
     ++$count;
     if ($count>38) { $count=0}
         $line=~s/\"t\".*//;
         $line=$line . "\"t\": $count},";
  }
  print "$line\n";
}
